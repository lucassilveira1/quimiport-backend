// Caso de uso: atualizar status da carga. Responsável: Paula
// Usa a máquina de estados em src/domain/value-objects/StatusCarga.ts

import { CargaRepository } from "../../repositories/CargaRepository";
import { StatusCargaType, podeTransicionar } from "../../../domain/value-objects/StatusCarga";
import { DomainError } from "../../../domain/errors/DomainError";

export class AtualizarStatusCarga {
  constructor(private readonly cargaRepository: CargaRepository) {}

  async executar(id: string, novoStatus: StatusCargaType) {
    const carga = await this.cargaRepository.buscarPorId(id);
    if (!carga) {
      throw new DomainError("Carga química não encontrada.");
    }
    if (!podeTransicionar(carga.status, novoStatus)) {
      throw new DomainError(`Transição de status inválida: ${carga.status} -> ${novoStatus}`);
    }

    return this.cargaRepository.atualizarStatus(id, novoStatus);
  }
}
