import {
  pgTable,
  uuid,
  text,
  timestamp,
  foreignKey,
} from "drizzle-orm/pg-core";
import { responsavelTecnico } from "./responsavelTecnico";

export const cargaQuimica = pgTable(
  "carga_quimica",
  {
    id: uuid("id").primaryKey().defaultRandom(),
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
      name: "fk_carga_quimica_responsavel",
      columns: [table.responsavelTecnicoId],
      foreignColumns: [responsavelTecnico.id],
    }),
  ],
);
