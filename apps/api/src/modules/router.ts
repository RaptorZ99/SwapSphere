import type { Router } from "express";
import { Router as createRouter } from "express";

import { createItemsRouter } from "./items/items.routes.js";
import { createTradesRouter } from "./trades/trades.routes.js";
import { createUsersRouter } from "./users/users.routes.js";
import type { AppDependencies } from "./dependencies.js";

export const createApiRouter = (dependencies: AppDependencies): Router => {
  const router = createRouter();

  router.get("/", (_req, res) => {
    res.status(200).json({
      data: {
        name: "SwapSphere API",
        version: "v1"
      }
    });
  });

  router.use(createUsersRouter(dependencies.usersService));
  router.use(createItemsRouter(dependencies.itemsService));
  router.use(createTradesRouter(dependencies.tradesService));

  return router;
};
