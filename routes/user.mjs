import Express from "express";
import * as NSR from "node-server-router";
import auth from "../auth/authUser.mjs";
import DAL from "../db/DAL.mjs";

/**
 * Gets the logged in user.
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getUser = (req, res) => {
  delete req.user.Password;
  return res.status(200).json(req.user);
};

/**
 * Get all the users in the database
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getAllUsers = (req, res) => {
  DAL.getAllUsers()
    .then((users) => res.status(200).json(users))
    .catch((err) =>
      res
        .status(500)
        .json({ error: err.message, status: 500, code: "SERVER_ERROR" })
    );
};

/**
 * Get a user by their id
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getUserById = (req, res) => {
  var id = req.params.usr_id;
  if (id === null || id === undefined) id = req.user.UserID;
  DAL.getUserById(id)
    .then((user) => {
      if (!user) return res.sendStatus(404);
      res.status(200).json(user);
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
 * Update any or all properties of a user.
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateUser = (req, res) => {
  var id = req.params.usr_id;
  if (id === null || id === undefined) id = req.user.UserID;
  const updates = Object.keys(req.body).map((key) => ({
    [key]: req.body[key],
  }));
  DAL.updateUser(id, ...updates)
    .then((user) => {
      if (!user) return res.sendStatus(404);
      res.status(200).json(user);
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
 * Create a new user. (will hash password)
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createUser = (req, res) => {
  DAL.registerUser(req.body)
    .then((user) => res.status(201).json(user))
    .catch((err) =>
      res.status(500).json({
        error: err.message,
        status: 500,
        code: "SERVER_ERROR",
      })
    );
};

/**
 * Delete logged in user.
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteUser = (req, res) => {
  var id = req.params.usr_id;
  if (id === null || id === undefined) id = req.user.UserID;
  DAL.deleteUser(id)
    .then(() => res.sendStatus(204))
    .catch((err) =>
      res.status(500).json({
        error: err.message,
        status: 500,
        code: "SERVER_ERROR",
      })
    );
};

/**
 * User resource routes
 * @type {NSR.Routes}
 */
export default [
  {
    url: "/user",
    action: NSR.HTTPAction.GET,
    handlers: [auth, getUser],
  },
  {
    url: "/users",
    action: NSR.HTTPAction.GET,
    handlers: [auth, getAllUsers],
  },
  {
    url: "/user/:usr_id",
    action: NSR.HTTPAction.GET,
    handlers: [auth, getUserById],
  },
  {
    url: "/user",
    action: NSR.HTTPAction.POST,
    handlers: [createUser],
  },
  {
    url: "/user",
    action: NSR.HTTPAction.PATCH,
    handlers: [auth, updateUser],
  },
  {
    url: "/user/:usr_id",
    action: NSR.HTTPAction.PUT,
    handlers: [auth, updateUser],
  },
  {
    url: "/user",
    action: NSR.HTTPAction.DELETE,
    handlers: [auth, deleteUser],
  },
  {
    url: "/user/:usr_id",
    action: NSR.HTTPAction.DELETE,
    handlers: [auth, deleteUser],
  },
];
