// Caso de uso: liberar carga química. Responsável: Paula

import { CargaRepository } from "../../repositories/CargaRepository";

export class LiberarCarga {
  constructor(private readonly cargaRepository: CargaRepository) {}

  async executar(id: string) {
    // TODO: checar documentacaoObrigatoria antes de liberar
    throw new Error("Não implementado.");
  }
}
