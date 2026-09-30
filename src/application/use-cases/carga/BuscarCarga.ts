// Caso de uso: buscar carga química por id.
// Criado por Vitor para o endpoint GET /cargas-quimicas/:id — Paula, favor revisar.

import { CargaRepository } from "../../repositories/CargaRepository";
import { CargaQuimica } from "../../../domain/entities/CargaQuimica";
import { DomainError } from "../../../domain/errors/DomainError";

export class BuscarCarga {
  constructor(private readonly cargaRepository: CargaRepository) {}

  async executar(id: string): Promise<CargaQuimica> {
    const carga = await this.cargaRepository.buscarPorId(id);
    if (!carga) {
      throw new DomainError("CARGA_NAO_ENCONTRADA", "Carga química não encontrada.");
    }
    return carga;
  }
}
