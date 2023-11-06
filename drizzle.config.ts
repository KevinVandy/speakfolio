import DotEnv from "dotenv";
import type { Config } from "drizzle-kit";

DotEnv.config();

export default {
  dbCredentials: {
    connectionString: process.env.DB_CONNECTION_STRING!,
  },
  driver: "pg",
  out: "./db/migrations",
  schema: "./db/schemas/*",
} satisfies Config;
