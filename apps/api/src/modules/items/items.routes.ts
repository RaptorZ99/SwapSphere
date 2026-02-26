import { Router } from "express";

import { validateRequest } from "../../lib/validation.js";
import type { ItemsServiceContract } from "./items.service.js";
import { createItemsController } from "./items.controller.js";
import { myItemsSchema, userItemsSchema } from "./items.validators.js";

export const createItemsRouter = (itemsService: ItemsServiceContract): Router => {
  const router = Router();
  const controller = createItemsController(itemsService);

  router.get("/items/me", validateRequest(myItemsSchema), controller.getMyItems);
  router.get("/users/:userId/items", validateRequest(userItemsSchema), controller.getUserItems);

  return router;
};
