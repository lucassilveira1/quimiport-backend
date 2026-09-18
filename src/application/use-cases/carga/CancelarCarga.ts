// Caso de uso: cancelar carga química. Responsável: Paula

import { CargaRepository } from "../../repositories/CargaRepository";

export class CancelarCarga {
  constructor(private readonly cargaRepository: CargaRepository) {}

  async executar(id: string) {
    // TODO: carga finalizada não pode ser cancelada (ver StatusCarga.ts)
    throw new Error("Não implementado.");
  }
}
