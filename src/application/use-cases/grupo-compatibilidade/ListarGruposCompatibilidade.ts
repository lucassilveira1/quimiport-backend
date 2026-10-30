// Caso de uso: listar grupos de compatibilidade, para quem consome a API saber os ids e códigos aceitos.

import { GrupoCompatibilidadeRepository } from "../../repositories/GrupoCompatibilidadeRepository";
import { Referencia } from "../../../domain/value-objects/Referencia";

export class ListarGruposCompatibilidade {
  constructor(private readonly grupoCompatibilidadeRepository: GrupoCompatibilidadeRepository) {}

  async executar(): Promise<Referencia[]> {
    return this.grupoCompatibilidadeRepository.listar();
  }
}
