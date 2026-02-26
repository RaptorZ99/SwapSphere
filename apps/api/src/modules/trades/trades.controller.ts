import type { TradeCreateInput, TradeMessageCreateInput } from "@swapsphere/shared-types";
import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http-response.js";
import { requireSelectedUserId } from "../../lib/require-selected-user.js";
import { getValidatedPayload } from "../../lib/validation.js";
import type { TradesServiceContract } from "./trades.service.js";

type CreateTradePayload = {
  body: TradeCreateInput;
};

type TradeByIdPayload = {
  params: {
    tradeId: string;
  };
};

type TradeMessagePayload = {
  params: {
    tradeId: string;
  };
  body: TradeMessageCreateInput;
};

export const createTradesController = (tradesService: TradesServiceContract) => {
  return {
    createTrade: async (req: Request, res: Response): Promise<void> => {
      const proposerId = requireSelectedUserId(req);
      const payload = getValidatedPayload<CreateTradePayload>(res);

      const response = await tradesService.createTrade(proposerId, payload.body);
      sendSuccess(res, 201, response);
    },

    getInboxTrades: async (req: Request, res: Response): Promise<void> => {
      const selectedUserId = requireSelectedUserId(req);

      const response = await tradesService.getInboxTrades(selectedUserId);
      sendSuccess(res, 200, response);
    },

    getTradeDetail: async (req: Request, res: Response): Promise<void> => {
      const selectedUserId = requireSelectedUserId(req);
      const payload = getValidatedPayload<TradeByIdPayload>(res);

      const response = await tradesService.getTradeDetail(selectedUserId, payload.params.tradeId);
      sendSuccess(res, 200, response);
    },

    acceptTrade: async (req: Request, res: Response): Promise<void> => {
      const selectedUserId = requireSelectedUserId(req);
      const payload = getValidatedPayload<TradeByIdPayload>(res);

      const response = await tradesService.acceptTrade(selectedUserId, payload.params.tradeId);
      sendSuccess(res, 200, response);
    },

    rejectTrade: async (req: Request, res: Response): Promise<void> => {
      const selectedUserId = requireSelectedUserId(req);
      const payload = getValidatedPayload<TradeByIdPayload>(res);

      const response = await tradesService.rejectTrade(selectedUserId, payload.params.tradeId);
      sendSuccess(res, 200, response);
    },

    sendTradeMessage: async (req: Request, res: Response): Promise<void> => {
      const selectedUserId = requireSelectedUserId(req);
      const payload = getValidatedPayload<TradeMessagePayload>(res);

      const response = await tradesService.sendTradeMessage(
        selectedUserId,
        payload.params.tradeId,
        payload.body.message
      );
      sendSuccess(res, 201, response);
    }
  };
};
