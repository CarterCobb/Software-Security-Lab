import dotenv from "dotenv";
dotenv.config();

// Nodejs generals
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;

// SQL Conf
export const SQL_CONFIG_SERVER = process.env.SQL_CONFIG_SERVER;
export const SQL_CONFIG_USER = process.env.SQL_CONFIG_USER;
export const SQL_CONFIG_PASSWORD = process.env.SQL_CONFIG_PASSWORD;
export const SQL_CONFIG_DATABASE = process.env.SQL_CONFIG_DATABASE;
export const SQL_CONFIG_INSTANCE = process.env.SQL_CONFIG_INSTANCE;
export const SQL_CONFIG_PORT = process.env.SQL_CONFIG_PORT;

// JWT secret
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Session secret
export const SESSION_SECRET = process.env.SESSION_SECRET;
