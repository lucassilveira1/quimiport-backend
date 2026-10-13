import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const classeRisco = pgTable("classe_risco", {
  id: uuid("id").primaryKey().defaultRandom(),
  classe: text("classe").notNull(),
  descricao: text("descricao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
