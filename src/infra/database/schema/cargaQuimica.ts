import {
  pgTable,
  uuid,
  text,
  timestamp,
  foreignKey,
} from "drizzle-orm/pg-core";
import { responsavelTecnico } from "./responsavelTecnico";
import { produtoQuimico } from "./produtoQuimico";

export const cargaQuimica = pgTable(
  "carga_quimica",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    produtoQuimicoId: uuid("produto_quimico_id").notNull(),
    responsavelTecnicoId: uuid("responsavel_tecnico_id").notNull(),
    codigoCarga: text("codigo_carga").notNull(),
    quantidade: text("quantidade"),
    unidadeMedida: text("unidade_medida"),
    origem: text("origem"),
    destino: text("destino"),
    documentacaoObrigatoria: text("documentacao_obrigatoria"),
    status: text("status").notNull(),
    dataEntrada: timestamp("data_entrada"),
    motivoBloqueio: text("motivo_bloqueio"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: "fk_carga_quimica_produto",
      columns: [table.produtoQuimicoId],
      foreignColumns: [produtoQuimico.id],
    }),
    foreignKey({
      name: "fk_carga_quimica_responsavel",
      columns: [table.responsavelTecnicoId],
      foreignColumns: [responsavelTecnico.id],
    }),
  ],
);
