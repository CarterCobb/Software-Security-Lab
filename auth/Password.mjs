import { randomBytes, createHash } from "crypto";

class Password {
  /**
   * Hash a password with SHA256
   * @param {String} password
   * @returns {String} hash delimited with 'g' then salt
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
    const [hashedPassword, salt] = hash.split("g");
    const re_hash = createHash("sha256").update(`${str}${salt}`).digest("hex")
    return re_hash.toString("hex") === hashedPassword;
  }
}

export default Password;
