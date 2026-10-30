// Contrato do repositório de grupos de compatibilidade (cadastro populado pelo seed da migration 0003).

import { Referencia } from "../../domain/value-objects/Referencia";

export interface GrupoCompatibilidadeRepository {
  listar(): Promise<Referencia[]>;
  /** Busca o grupo pelo id ou pelo código (ex.: "G1"); null se não existir. */
  buscarPorReferencia(referencia: string): Promise<Referencia | null>;
}
