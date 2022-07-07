import Express from "express";

/**
 * Authenticate a user with a JWT
 * @todo Implement
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Express.NextFunction} next
 */
const auth = (req, res, next) => {
  next();
};

/**
 * Create a JWT for the user.
 * @param {Number} id 
 */
export const generateToken = (id) => {};

export default auth;
