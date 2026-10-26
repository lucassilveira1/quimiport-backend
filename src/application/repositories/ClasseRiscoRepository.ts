// Contrato do repositório de classes de risco (cadastro populado pelo seed da migration 0002).

import { Referencia } from "../../domain/value-objects/Referencia";

export interface ClasseRiscoRepository {
  listar(): Promise<Referencia[]>;
  /** Busca a classe de risco pelo id; null se não existir. */
  buscarPorId(id: string): Promise<Referencia | null>;
}
