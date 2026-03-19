import type { ItemCategory } from "@swapsphere/shared";
import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http-response.js";
import { requireSelectedUserId } from "../../lib/require-selected-user.js";
import { getValidatedPayload } from "../../lib/validation.js";
import type { ItemsServiceContract } from "./items.service.js";

type MyItemsPayload = {
  query: {
    category?: ItemCategory;
  };
};

type UserItemsPayload = {
  params: {
    userId: string;
  };
  query: {
    category?: ItemCategory;
  };
};

export const createItemsController = (itemsService: ItemsServiceContract) => {
  return {
    getMyItems: async (req: Request, res: Response): Promise<void> => {
      const selectedUserId = requireSelectedUserId(req);
      const payload = getValidatedPayload<MyItemsPayload>(res);

      const items = await itemsService.getItemsByOwner(selectedUserId, payload.query.category);
      sendSuccess(res, 200, items);
    },

    getUserItems: async (_req: Request, res: Response): Promise<void> => {
      const payload = getValidatedPayload<UserItemsPayload>(res);

      const items = await itemsService.getItemsByOwner(payload.params.userId, payload.query.category);
      sendSuccess(res, 200, items);
    }
  };
};
