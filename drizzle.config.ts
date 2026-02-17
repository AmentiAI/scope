import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_xl8ABHNZoP3z@ep-proud-breeze-aity33dq.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});
