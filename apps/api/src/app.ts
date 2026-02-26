import express from "express";
import type { Express } from "express";

import { createDefaultDependencies, type AppDependencies } from "./modules/dependencies.js";
import { createApiRouter } from "./modules/router.js";
import { accessLoggerMiddleware } from "./middleware/access-logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestContextMiddleware } from "./middleware/request-context.js";
import { sessionSelectionMiddleware } from "./middleware/session.js";

export const createApp = (dependencies: AppDependencies = createDefaultDependencies()): Express => {
  const app: Express = express();

  app.disable("x-powered-by");

  app.get("/health", (_req, res) => {
    res.status(200).json({
      data: {
        status: "ok"
      }
    });
  });

  app.use(requestContextMiddleware);
  app.use(accessLoggerMiddleware);
  app.use(express.json({ limit: "1mb" }));
  app.use(sessionSelectionMiddleware);

  app.use("/api/v1", createApiRouter(dependencies));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
