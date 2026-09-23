// Caso de uso: liberar carga química. Responsável: Paula

import { CargaRepository } from "../../repositories/CargaRepository";
import { CargaQuimica } from "../../../domain/entities/CargaQuimica";
import { DomainError } from "../../../domain/errors/DomainError";

export class LiberarCarga {
  constructor(private readonly cargaRepository: CargaRepository) {}

  async executar(id: string): Promise<CargaQuimica> {
    const carga = await this.cargaRepository.buscarPorId(id);
    if (!carga) {
      throw new DomainError("CARGA_NAO_ENCONTRADA", "Carga química não encontrada.");
    }
    carga.liberar();
    return this.cargaRepository.atualizarStatus(id, carga.status);
  }
}
