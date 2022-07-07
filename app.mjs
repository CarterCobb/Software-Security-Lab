import express from "express";
import * as nsr from "node-server-router";
import os from "os";
import cluster from "cluster";
import { NODE_ENV, PORT as ENV_PORT } from "./keys.mjs";

const PORT = ENV_PORT || 7777;

if (cluster.isPrimary && NODE_ENV === "production") {
  for (var _ = 0; _ < os.cpus().length; _++) cluster.fork();
  cluster.on("exit", (worker) => {
    console.log(`[${worker.process.pid}] Died; spinning new instance up...`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(express.json());

  nsr.RouteFactory.applyRoutesTo(app, {
    api_version: "/v1",
    log_configured: true,
  });

  app.listen(PORT, () =>
    console.log(`[${process.pid}] Started on port: ${PORT}`)
  );
}
