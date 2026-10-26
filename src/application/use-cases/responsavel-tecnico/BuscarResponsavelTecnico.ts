// Caso de uso: buscar responsável técnico por id.

import { ResponsavelTecnicoRepository } from "../../repositories/ResponsavelTecnicoRepository";
import { ResponsavelTecnico } from "../../../domain/entities/ResponsavelTecnico";
import { DomainError } from "../../../domain/errors/DomainError";

export class BuscarResponsavelTecnico {
  constructor(private readonly responsavelTecnicoRepository: ResponsavelTecnicoRepository) {}

  async executar(id: string): Promise<ResponsavelTecnico> {
    const responsavel = await this.responsavelTecnicoRepository.buscarPorId(id);
    if (!responsavel) {
      throw new DomainError("RESPONSAVEL_TECNICO_NAO_ENCONTRADO", "Responsável técnico não encontrado.");
    }
    return responsavel;
  }
}
