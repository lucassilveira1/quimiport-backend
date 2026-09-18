// Caso de uso: bloquear carga química. Responsável: Paula

import { CargaRepository } from "../../repositories/CargaRepository";

export class BloquearCarga {
  constructor(private readonly cargaRepository: CargaRepository) {}

  async executar(id: string) {
    // TODO: só permitido a partir de "em_inspecao" (ver StatusCarga.ts)
    throw new Error("Não implementado.");
  }
}
