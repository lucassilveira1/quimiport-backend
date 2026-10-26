// Caso de uso: cadastrar responsável técnico.

import { ResponsavelTecnicoRepository } from "../../repositories/ResponsavelTecnicoRepository";
import {
  ResponsavelTecnico,
  ResponsavelTecnicoProps,
} from "../../../domain/entities/ResponsavelTecnico";

export type CriarResponsavelTecnicoInput = Omit<
  ResponsavelTecnicoProps,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export class CriarResponsavelTecnico {
  constructor(private readonly responsavelTecnicoRepository: ResponsavelTecnicoRepository) {}

  async executar(dados: CriarResponsavelTecnicoInput): Promise<ResponsavelTecnico> {
    const responsavel = ResponsavelTecnico.criar(dados);
    return this.responsavelTecnicoRepository.criar(responsavel);
  }
}
