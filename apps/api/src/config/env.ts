import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://swapsphere:swapsphere@localhost:5174/swapsphere")
});

export const env = envSchema.parse(process.env);
