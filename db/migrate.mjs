import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import DotEnv from "dotenv";

DotEnv.config();

const sql = postgres(process.env.DB_CONNECTION_STRING, { max: 1 });
const db = drizzle(sql);

const main = async () => {
  console.log("Migrating...");
  await migrate(db, { migrationsFolder: "./db/migrations" });
  console.log("Done Migrating!");
};

main();
