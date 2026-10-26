// Caso de uso: listar responsáveis técnicos.

import { ResponsavelTecnicoRepository } from "../../repositories/ResponsavelTecnicoRepository";
import { ResponsavelTecnico } from "../../../domain/entities/ResponsavelTecnico";

export class ListarResponsaveisTecnicos {
  constructor(private readonly responsavelTecnicoRepository: ResponsavelTecnicoRepository) {}

  async executar(): Promise<ResponsavelTecnico[]> {
    return this.responsavelTecnicoRepository.listar();
  }
}
