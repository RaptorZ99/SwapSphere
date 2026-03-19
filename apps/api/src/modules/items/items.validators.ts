import { ItemCategory } from "@swapsphere/shared";
import { z } from "zod";

const categorySchema = z.nativeEnum(ItemCategory).optional();

export const myItemsSchema = z.object({
  params: z.object({}).optional(),
  query: z.object({
    category: categorySchema
  }),
  body: z.object({}).optional()
});

export const userItemsSchema = z.object({
  params: z.object({
    userId: z.string().uuid()
  }),
  query: z.object({
    category: categorySchema
  }),
  body: z.object({}).optional()
});
