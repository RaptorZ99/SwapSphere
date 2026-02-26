import { Router } from "express";

import { validateRequest } from "../../lib/validation.js";
import type { UsersServiceContract } from "./users.service.js";
import { createUsersController } from "./users.controller.js";
import { selectUserSchema } from "./users.validators.js";

export const createUsersRouter = (usersService: UsersServiceContract): Router => {
  const router = Router();
  const controller = createUsersController(usersService);

  router.get("/users", controller.listUsers);
  router.post("/session/select-user", validateRequest(selectUserSchema), controller.selectUser);

  return router;
};
