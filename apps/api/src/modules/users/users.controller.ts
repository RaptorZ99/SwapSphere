import type { Request, Response } from "express";
import type { SelectUserInput } from "@swapsphere/shared";

import { sendSuccess } from "../../lib/http-response.js";
import { getValidatedPayload } from "../../lib/validation.js";
import { setSelectedUserCookie } from "../../middleware/session.js";
import type { ErrorResponse } from "../../types/http.js";
import type { UsersServiceContract } from "./users.service.js";

type SelectUserPayload = {
  body: SelectUserInput;
};

export const createUsersController = (usersService: UsersServiceContract) => {
  return {
    listUsers: async (_req: Request, res: Response): Promise<void> => {
      const users = await usersService.listUsers();
      sendSuccess(res, 200, users);
    },

    selectUser: async (_req: Request, res: Response<ErrorResponse>): Promise<void> => {
      const payload = getValidatedPayload<SelectUserPayload>(res);

      const selectedUser = await usersService.selectUser(payload.body.userId);

      setSelectedUserCookie(res, selectedUser.userId);
      sendSuccess(res, 200, selectedUser);
    }
  };
};
