import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não foi definida nas variáveis de ambiente.");
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema, casing: "snake_case" });
