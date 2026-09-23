// Caso de uso: atualizar status da carga. Responsável: Paula
// Usa a máquina de estados em src/domain/value-objects/StatusCarga.ts

import { CargaRepository } from "../../repositories/CargaRepository";
import { CargaQuimica } from "../../../domain/entities/CargaQuimica";
import { StatusCargaType } from "../../../domain/value-objects/StatusCarga";
import { DomainError } from "../../../domain/errors/DomainError";

export class AtualizarStatusCarga {
  constructor(private readonly cargaRepository: CargaRepository) {}

  async executar(id: string, novoStatus: StatusCargaType): Promise<CargaQuimica> {
    const carga = await this.cargaRepository.buscarPorId(id);
    if (!carga) {
      throw new DomainError("CARGA_NAO_ENCONTRADA", "Carga química não encontrada.");
    }
    carga.transicionarPara(novoStatus);
    return this.cargaRepository.atualizarStatus(id, novoStatus);
  }
}
