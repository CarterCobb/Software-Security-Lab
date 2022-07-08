import session from "express-session";
import Express from "express";
import { SESSION_SECRET, NODE_ENV } from "../keys.mjs";
import MSSQLStore from "./MssqlStore.mjs";
import logger from "../logger.mjs";

/**
 * Session configuration
 */
export default class SessionConfig {
  /**
   * Configures the express session and its data stores.
   * @param {Express.Application}
   */
  static async configure(app) {
    const session_config = {
      secret: SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
      cookie: {
        httpOnly: NODE_ENV !== "production",
        secure: NODE_ENV === "production",
        maxAge: 10800000,
        sameSite: "strict",
      },
    };
    if (NODE_ENV === "production") {
      const store = new MSSQLStore({
        reapInterval: 3600, // 1 hr
        ttl: 3600, // 1 hour
        reapCB: () => logger.success("Reap Successful"),
      });
      session_config.store = store;
    }
    app.use(session(session_config));
    logger.success(
      `Configured session; storing in: ${
        NODE_ENV === "production" ? "SQL Database" : "Memory Storage"
      }`
    );
    // ------------- FOR DEBUGGING -------------
    app.use((req, _, next) => {
      console.log(req.session);
      next();
    });
  }
}
