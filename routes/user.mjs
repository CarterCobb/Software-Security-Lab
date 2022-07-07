import Express from "express";
import * as NSR from "node-server-router";
import auth from "../auth/authUser.mjs";

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
 * @todo implement
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getAllUsers = (req, res) => {
  res.sendStatus(200);
};

/**
 * Get a user by theri id
 * @todo implement
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getUserById = (req, res) => {
  const id = req.params.usr_id;
  if (id === null || id === undefined) return res.sendStatus(404);
  res.sendStatus(200);
};

/**
 * Update any or all properties of a user.
 * @todo implement
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateUser = (req, res) => {};

/**
 * Create a new user. (will hash password)
 * @todo implement
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createUser = (req, res) => {
  return res.sendStatus(201);
};

/**
 * Delete logged in user.
 * @todo implement
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteUser = (req, res) => {
  return res.sendStatus(204);
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
    handlers: [auth, createUser],
  },
  {
    url: "/user",
    action: NSR.HTTPAction.PATCH,
    handlers: [auth, updateUser],
  },
  {
    url: "/user",
    action: NSR.HTTPAction.DELETE,
    handlers: [auth, deleteUser],
  },
];
