import { pgTable, uuid, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { produtoQuimico } from "./produtoQuimico";
import { cargaQuimica } from "./cargaQuimica";

export const produtoCargaQuimica = pgTable(
  "produto_carga_quimica",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    produtoId: uuid("produto_id").notNull(),
    cargaQuimicaId: uuid("carga_quimica_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: "fk_produto_carga_produto",
      columns: [table.produtoId],
      foreignColumns: [produtoQuimico.id],
    }),
    foreignKey({
      name: "fk_produto_carga_carga",
      columns: [table.cargaQuimicaId],
      foreignColumns: [cargaQuimica.id],
    }),
  ],
);
