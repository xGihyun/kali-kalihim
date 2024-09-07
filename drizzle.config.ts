import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
  verbose: true,
  strict: true,
});
