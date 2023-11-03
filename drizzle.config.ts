import type { Config } from "drizzle-kit";
import DotEnv from "dotenv";

DotEnv.config();

export default {
  schema: "./db/schemas/*",
  out: "./db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DB_CONNECTION_STRING!,
  },
} satisfies Config;
