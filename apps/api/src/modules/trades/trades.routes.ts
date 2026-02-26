import { Router } from "express";

import { validateRequest } from "../../lib/validation.js";
import type { TradesServiceContract } from "./trades.service.js";
import { createTradesController } from "./trades.controller.js";
import { createTradeSchema, tradeByIdSchema, tradeMessageSchema } from "./trades.validators.js";

export const createTradesRouter = (tradesService: TradesServiceContract): Router => {
  const router = Router();
  const controller = createTradesController(tradesService);

  router.post("/trades", validateRequest(createTradeSchema), controller.createTrade);
  router.get("/trades/inbox", controller.getInboxTrades);
  router.get("/trades/:tradeId", validateRequest(tradeByIdSchema), controller.getTradeDetail);
  router.post("/trades/:tradeId/actions/accept", validateRequest(tradeByIdSchema), controller.acceptTrade);
  router.post("/trades/:tradeId/actions/reject", validateRequest(tradeByIdSchema), controller.rejectTrade);
  router.post("/trades/:tradeId/messages", validateRequest(tradeMessageSchema), controller.sendTradeMessage);

  return router;
};
