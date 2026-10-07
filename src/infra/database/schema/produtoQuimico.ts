import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  foreignKey,
} from "drizzle-orm/pg-core";
import { classeRisco } from "./classeRisco";
import { grupoCompatibilidade } from "./grupoCompatibilidade";

export const produtoQuimico = pgTable(
  "produto_quimico",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    classeRiscoId: uuid("classe_risco_id").notNull(),
    grupoCompatibilidadeId: uuid("grupo_compatibilidade_id").notNull(),
    nome: text("nome").notNull(),
    descricao: text("descricao"),
    numeroOnu: varchar("numero_onu", { length: 50 }),
    status: text("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: "fk_produto_quimico_classe_risco",
      columns: [table.classeRiscoId],
      foreignColumns: [classeRisco.id],
    }),
    foreignKey({
      name: "fk_produto_quimico_grupo_compat",
      columns: [table.grupoCompatibilidadeId],
      foreignColumns: [grupoCompatibilidade.id],
    }),
  ],
);
