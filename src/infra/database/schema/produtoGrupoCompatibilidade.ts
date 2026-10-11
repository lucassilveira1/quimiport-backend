import { pgTable, uuid, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { produtoQuimico } from "./produtoQuimico";
import { cargaQuimica } from "./cargaQuimica";
import { grupoCompatibilidade } from "./grupoCompatibilidade";

export const produtoGrupoCompatibilidade = pgTable(
  "produto_grupo_compatibilidade",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    produtoId: uuid("produto_id").notNull(),
    grupoCompatibilidadeId: uuid("grupo_compatibilidade_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: "fk_produto_grupo_produto",
      columns: [table.produtoId],
      foreignColumns: [produtoQuimico.id],
    }),
    foreignKey({
      name: "fk_produto_grupo_grupo",
      columns: [table.grupoCompatibilidadeId],
      foreignColumns: [grupoCompatibilidade.id],
    }),
  ],
);
