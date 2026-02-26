import { z } from "zod";

const uuidSchema = z.string().uuid();

export const createTradeSchema = z.object({
  body: z.object({
    recipientId: uuidSchema,
    offeredItemIds: z.array(uuidSchema).min(1),
    requestedItemIds: z.array(uuidSchema).min(1),
    message: z.string().trim().min(1).max(1000)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const tradeByIdSchema = z.object({
  params: z.object({
    tradeId: uuidSchema
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional()
});

export const tradeMessageSchema = z.object({
  params: z.object({
    tradeId: uuidSchema
  }),
  body: z.object({
    message: z.string().trim().min(1).max(1000)
  }),
  query: z.object({}).optional()
});
