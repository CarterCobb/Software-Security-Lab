import { randomBytes, createHash } from "crypto";

class Password {
  /**
   * Hash a password with SHA256
   * @param {String} password
   * @returns {String} <hash.salt>
   */
  static toHash(password) {
    const salt = randomBytes(16).toString("hex");
    const hash = createHash("sha256").update(`${password}${salt}`).digest("hex")
    return `${hash}g${salt}`;
  }

  /**
   * Compare passwords
   * @param {String} hash
   * @param {String} str
   * @returns {Boolean} is correct password
   */
  static compare(hash, str) {
    // split() returns array
    const [hashedPassword, salt] = hash.split("g");
    // we hash the new sign-in password
    const re_hash = createHash("sha256").update(`${str}${salt}`).digest("hex")
    // compare the new supplied password with the stored hashed password
    return re_hash.toString("hex") === hashedPassword;
  }
}

export default Password;
