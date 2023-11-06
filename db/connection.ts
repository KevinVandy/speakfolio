import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const client = postgres(process.env.DB_CONNECTION_STRING!);
export const db = drizzle(client);
