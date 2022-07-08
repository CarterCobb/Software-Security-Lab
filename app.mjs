import express from "express";
import * as nsr from "node-server-router";
import SessionConfig from "./session/sessionConf.mjs";
import os from "os";
import cluster from "cluster";
import { NODE_ENV, PORT as ENV_PORT } from "./keys.mjs";
import logger from "./logger.mjs";

const PORT = ENV_PORT || 7777;

logger.log(
  `\r\n\x1b[33m---------------------- \x1b[37m${NODE_ENV.toUpperCase()} ENVIRONMENT \x1b[33m----------------------\r\n`
);

// Master Process
if (cluster.isPrimary && NODE_ENV === "production") {
  for (var _ = 0; _ < os.cpus().length; _++) cluster.fork();
  cluster.on("exit", () => {
    logger.error("Died; spinning new instance up...");
    cluster.fork();
  });
} else {
  // Child Processs
  const app = express();
  app.use(express.json());

  // Inject routes
  nsr.RouteFactory.applyRoutesTo(app, {
    api_version: "/v1",
  });
  logger.success("Routes configured");

  // Configure session
  SessionConfig.configure(app);

  app.listen(PORT, () => logger.success(`Started on port: ${PORT}`));
}
