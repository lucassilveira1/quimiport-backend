import { pgTable, uuid, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const responsavelTecnico = pgTable("responsavel_tecnico", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  telefone: text("telefone"),
  email: text("email"),
  cpf: varchar("cpf", { length: 14 }),
  status: text("status").notNull(),
  registroCrq: text("registro_crq"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
