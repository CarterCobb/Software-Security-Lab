import sql from "mssql";
import {
  SQL_CONFIG_DATABASE,
  SQL_CONFIG_INSTANCE,
  SQL_CONFIG_PASSWORD,
  SQL_CONFIG_PORT,
  SQL_CONFIG_SERVER,
  SQL_CONFIG_USER,
} from "../keys.mjs";
import PasswordHash from "../auth/Password.mjs";

// SQL config
const sqlConfig = {
  server: SQL_CONFIG_SERVER,
  authentication: {
    type: "default",
    options: {
      userName: SQL_CONFIG_USER,
      password: SQL_CONFIG_PASSWORD,
    },
  },
  options: {
    // If you are on Microsoft Azure, you need encryption:
    encrypt: true,
    port: parseInt(SQL_CONFIG_PORT),
    database: SQL_CONFIG_DATABASE,
    instancename: SQL_CONFIG_INSTANCE,
    trustServerCertificate: true,
  },
};

/**
 * Data Access Layer
 * The medium between the server and the database.
 */
class DAL {
  // +==========================+
  // |          USERS           |
  // +==========================+

  /**
   * Get a user by their `UserID`
   * @param {Promise<{Username: String, Password: String}>} id
   */
  static async getUserById(id) {
    const pool = await sql.connect(sqlConfig);
    const data = await pool
      .request()
      .input("userID", sql.Int, id)
      .query("SELECT * FROM [User] WHERE UserID = @userID");
    return data.recordset[0];
  }

  /**
   * Get a user by their `Username`
   * @param {String} username
   */
  static async getUserByUsername(username) {
    const pool = await sql.connect(sqlConfig);
    const data = await pool
      .request()
      .input("username", sql.VarChar(450), username)
      .query("SELECT * FROM [User] WHERE Username = @username");
    return data.recordset[0];
  }

  /**
   * Gets all the users in the database
   * @returns {Promise<Array<{Username: String, Password: String}>>}
   */
  static async getAllUsers() {
    const pool = await sql.connect(sqlConfig);
    const data = await pool.request().query("SELECT * FROM [User]");
    const users = [];
    for (var record of data.recordset) {
      var user = record;
      delete user.Password;
      users.push(user);
    }
    return users;
  }

  /**
   * Registers a user, hashes their password, and adds them to the database.
   * @param {{Username: String, Password: String}} user
   * @returns {{Username: String, Password: String}}
   */
  static async registerUser(user) {
    const { Username, Password } = user;
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("username", sql.VarChar(450), Username)
      .input("password", sql.VarChar(sql.MAX), PasswordHash.toHash(Password))
      .query("INSERT INTO [User] VALUES(@username, @password)");
    return this.getUserByUsername(Username);
  }

  /**
   * Updates a user
   * @param {Number} usr_id
   * @param  {...any} updates
   * @returns {Promise<{Username: String, Password: String}>}
   */
  static async updateUser(usr_id, ...updates) {
    const pool = await sql.connect(sqlConfig);
    for await (var update of updates) {
      const key = Object.keys(update)[0]; // only one item will be in the object so this can be static
      var value = update[key];
      if (key === "Password") value = PasswordHash.toHash(update[key]);
      await pool
        .request()
        .input("value", value)
        .input("userId", sql.Int, usr_id)
        .query(`UPDATE [User] SET ${key} = @value WHERE UserID = @userId`);
    }
    return this.getUserById(usr_id);
  }

  /**
   * Delete a user by its id
   * @param {Number} id
   */
  static async deleteUser(id) {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("userId", sql.Int, id)
      .query("DELETE FROM [User] WHERE UserID = @userId");
  }

  // +==========================+
  // |         SESSION          |
  // +==========================+

  /**
   * Creates the session table if it doesn't exist
   */
  static async createSessionTable() {
    let pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .query(
        "IF object_id('Session') IS NULL\
          CREATE TABLE [Session]\
            (\
              SessionID nvarchar(450) not null primary key,\
              SessionData nvarchar(max) null,\
              LastTouchedUtc datetime not null\
            )"
      );
  }

  /**
   * Reaps a session in SQL
   * @param {Number} ttl
   * @param {Functio} cb
   */
  static async reapSession(ttl, cb) {
    let pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("ttl", sql.Int, ttl)
      .query(
        "DELETE [Session] WHERE LastTouchedUtc <= dateadd(second, -1 * @ttl, getutcdate());"
      );
    cb();
  }

  /**
   * Get session data
   * @param {String} id
   * @param {Function} cb (err, data)
   */
  static async getSession(id, cb) {
    let pool = await sql.connect(sqlConfig);
    let data = await pool
      .request()
      .input("sessionID", sql.NVarChar(450), id)
      .query("SELECT SessionData FROM [Session] WHERE SessionID = @sessionId;");
    cb(
      null,
      data.recordset[0] ? JSON.parse(data.recordset[0].SessionData) : null
    );
  }

  /**
   * Set session to SQL
   * @param {Strinf} sessionId
   * @param {Object} session
   * @param {Function} cb (err, data)
   */
  static async setSession(sessionId, session, cb) {
    let pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("sessionId", sql.NVarChar(450), sessionId)
      .input("sessionData", sql.NVarChar(sql.MAX), JSON.stringify(session))
      .query(
        "IF EXISTS(SELECT SessionID FROM [Session] where SessionID = @sessionId)\
          BEGIN\
            UPDATE [Session] SET SessionData = @sessionData WHERE SessionID = @sessionId;\
          END\
        ELSE\
          BEGIN\
            INSERT INTO [Session] (SessionID, SessionData, LastTouchedUtc) VALUES(@sessionId, @sessionData, getutcdate());\
          END"
      );
    cb(null, session);
  }

  /**
   * Destroy session from SQL
   * @param {String} sessionId
   * @param {Function} cb
   */
  static async destroySession(sessionId, cb) {
    let pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("sessionId", sql.NVarChar(450), sessionId)
      .query("DELETE [Session] WHERE SessionID = @sessionId");
    cb();
  }

  /**
   * Updeats the lastTouchedUtc attribute
   * @param {String} sessionId
   * @param {Function} cb (err, data)
   */
  static async touchSession(sessionId, cb) {
    let pool = await sql.connect(sqlConfig);
    let data = await pool
      .request()
      .input("sessionId", sql.NVarChar(450), sessionId)
      .query(
        "UPDATE [Session] SET LastTouchedUtc = getutcdate() WHERE SessionID = @sessionId"
      );
    cb(null, data);
  }

  /**
   * Gets the count of items in the session table
   * @param {Function} cb (err, data)
   */
  static async lengthSession(cb) {
    let pool = await sql.connect(sqlConfig);
    let data = await pool.request().query("SELECT COUNT(*) FROM [Session]");
    cb(null, data);
  }

  /**
   * Clear items from session
   * @param {Function} cb
   */
  static async clearSession(cb) {
    let pool = await sql.connect(sqlConfig);
    await pool.request().query("DELETE [Session]");
    cb();
  }
}

export default DAL;
