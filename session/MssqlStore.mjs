import _ from "underscore";
import { Store } from "express-session";
import DAL from "../db/DAL.mjs";
import logger from "../logger.mjs";

/**
 * Gets the first item in the record set
 * @param {Array<Object>} recordset
 * @returns {Object}
 */
var _extractFirstValue = (recordset) => {
  var value = recordset;
  while (value && _.isArray(value)) value = value[0];
  if (value && _.isObject(value)) {
    for (var key in value) {
      value = value[key];
      return value;
    }
  }
};

/**
 * Custom SQL Server Express Session Data Store
 * Persists session in the SQL database in production environments only
 */
export default class MSSQLStore extends Store {
  constructor(conf) {
    super(conf);
    this.options = {
      ttl: 3600,
      reapInterval: 3600,
      reapCB: () => {},
    };
    this.options = { ...this.options, ...conf };
    DAL.createSessionTable().then(() =>
      logger.success(`Verified \`Session\` table exists`)
    );
  }

  async reap() {
    await DAL.reapSession(this.options.ttl, this.options.reapCB);
  }

  async get(sessionId, callback) {
    await DAL.getSession(sessionId, callback);
  }

  async set(sessionId, session, callback) {
    await DAL.setSession(sessionId, session, callback);
  }

  async destroy(sessionId, callback) {
    await DAL.destroySession(sessionId, callback);
  }

  async touch(sessionId, _session, callback) {
    await DAL.touchSession(sessionId, callback);
    return this;
  }

  async length(callback) {
    await DAL.lengthSession((err, recordset) => {
      if (err) return callback(err);
      var length = _extractFirstValue(recordset) || 0;
      callback(null, length);
    });
  }

  async clear(callback) {
    await DAL.clearSession(callback);
  }
}
