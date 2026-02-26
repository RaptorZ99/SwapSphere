import "dotenv/config";
import { defineConfig } from "prisma/config";

const fallbackDatabaseUrl = "postgresql://swapsphere:swapsphere@localhost:5174/swapsphere";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: process.env.DATABASE_URL ?? fallbackDatabaseUrl
  }
});
