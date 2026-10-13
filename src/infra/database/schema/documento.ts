import {
  pgTable,
  uuid,
  text,
  timestamp,
  foreignKey,
} from "drizzle-orm/pg-core";
import { cargaQuimica } from "./cargaQuimica";

export const documento = pgTable(
  "documento",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cargaQuimicaId: uuid("carga_quimica_id").notNull(),
    arquivo: text("arquivo").notNull(),
    titulo: text("titulo").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    foreignKey({
      name: "fk_documento_carga",
      columns: [table.cargaQuimicaId],
      foreignColumns: [cargaQuimica.id],
    }),
  ],
);
