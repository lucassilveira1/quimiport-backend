// Implementação concreta do repositório de cargas químicas.
// Responsável: Amanda/Samuel

import { CargaRepository } from "../../application/repositories/CargaRepository";
import { CargaQuimica } from "../../domain/entities/CargaQuimica";
import { StatusCargaType } from "../../domain/value-objects/StatusCarga";

export class CargaRepositoryImpl implements CargaRepository {
  async criar(carga: CargaQuimica): Promise<CargaQuimica> {
    throw new Error("Não implementado.");
  }

  async buscarPorId(id: string): Promise<CargaQuimica | null> {
    throw new Error("Não implementado.");
  }

  async listar(): Promise<CargaQuimica[]> {
    throw new Error("Não implementado.");
  }

  async atualizarStatus(id: string, novoStatus: StatusCargaType): Promise<CargaQuimica> {
    throw new Error("Não implementado.");
  }
}
