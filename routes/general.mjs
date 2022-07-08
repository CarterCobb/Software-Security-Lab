import DAL from "../db/DAL.mjs";
import Express from "express";
import * as NSR from "node-server-router";
import { generateToken } from "../auth/authUser.mjs";
import PasswordHash from "../auth/Password.mjs";

/**
 * Fail the login
 * @param {Express.Response} res
 * @returns {{error: String, status: Number, code: String}}
 */
const failLogin = (res) =>
  res.status(401).json({
    error: "Invalid Credentials",
    status: 401,
    code: "INVALID_CREDENTIALS",
  });

/**
 * Loggs the user in and stores their toekn in the session
 * @note to increase security, failure responses are all the same.
 *  No need to tell attackers exactly what when wrong when logging in.
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const login = async (req, res) => {
  const { Username, Password } = req.body;
  if (
    Username === null ||
    Username === undefined ||
    Password === null ||
    Password === undefined
  )
    return failLogin(res);
  DAL
    .getUserByUsername(Username)
    .then((user) => {
      if (!user.Password) return failLogin(res);
      if (PasswordHash.compare(user.Password, Password)) {
        const token = `Bearer ${generateToken(user.UserID)}`;
        req.session.token = token;
        delete user.Password;
        req.session.save(() =>
          res.status(200).json({ accessToken: token, user })
        );
      } else failLogin(res);
    })
    .catch((err) =>
      res.status(500).json({
        error: err.message,
        status: 500,
        code: "SERVER_ERROR",
      })
    );
};

/**
 * Destroys the user session
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const logout = (req, res) => {
  req.session.destroy();
  res.sendStatus(204);
};

export const routes = [
  {
    url: "/login",
    action: NSR.HTTPAction.POST,
    handlers: [login],
  },
  {
    url: "/logout",
    action: NSR.HTTPAction.POST,
    handlers: [logout],
  },
  {
    url: "/status",
    action: NSR.HTTPAction.GET,
    handlers: [(_, res) => res.sendStatus(204)],
  },
];
