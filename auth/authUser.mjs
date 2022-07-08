import Express from "express";
import { ACCESS_TOKEN_SECRET } from "../keys.mjs";
import jwt from "jsonwebtoken";
import DAL from "../db/DAL.mjs";
const { sign, verify } = jwt;

/**
 * Authenticate a user with a JWT
 * @todo Implement
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Express.NextFunction} next
 */
const auth = (req, res, next) => {
  try {
    const token = req.session.token && req.session.token.split(" ")[1];
    if (!token)
      return res.status(401).json({
        error: "Unauthorized client",
        status: 401,
        code: "UNAUTHORIZED",
      });
    verify(token, ACCESS_TOKEN_SECRET, async (err, { id }) => {
      if (err)
        return res.status(403).json({
          error: err.message,
          status: 403,
          code: "TOKEN_VERIFY_ERROR",
        });
      let user = await DAL.getUserById(id);
      if (!user)
        return res.status(404).json({
          error: `User ${id} no longer exists.`,
          status: 404,
          code: "USER_NOT_FOUND",
        });
      req.user = user;
      next();
    });
  } catch (err) {
    return handle(null, res, err);
  }
};

/**
 * Create a JWT for the user.
 * @param {Number} id
 */
export const generateToken = (id) =>
  sign({ id }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

export default auth;
