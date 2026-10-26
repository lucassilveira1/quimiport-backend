// Caso de uso: listar classes de risco, para quem consome a API saber os ids aceitos.

import { ClasseRiscoRepository } from "../../repositories/ClasseRiscoRepository";
import { Referencia } from "../../../domain/value-objects/Referencia";

export class ListarClassesRisco {
  constructor(private readonly classeRiscoRepository: ClasseRiscoRepository) {}

  async executar(): Promise<Referencia[]> {
    return this.classeRiscoRepository.listar();
  }
}
