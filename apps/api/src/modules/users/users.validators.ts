import { z } from "zod";

export const selectUserSchema = z.object({
  body: z.object({
    userId: z.string().uuid()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
