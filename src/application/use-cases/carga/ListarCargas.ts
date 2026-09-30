// Caso de uso: listar cargas químicas (com filtro opcional por status).
// Criado por Vitor para o endpoint GET /cargas-quimicas — Paula, favor revisar.

import { CargaRepository } from "../../repositories/CargaRepository";
import { CargaQuimica } from "../../../domain/entities/CargaQuimica";
import { StatusCargaType } from "../../../domain/value-objects/StatusCarga";

export interface ListarCargasFiltro {
  status?: StatusCargaType;
  produtoQuimicoId?: string;
}

export class ListarCargas {
  constructor(private readonly cargaRepository: CargaRepository) {}

  async executar(filtro: ListarCargasFiltro = {}): Promise<CargaQuimica[]> {
    const cargas = await this.cargaRepository.listar();
    return cargas.filter(
      (c) =>
        (!filtro.status || c.status === filtro.status) &&
        (!filtro.produtoQuimicoId || c.produtoQuimicoId === filtro.produtoQuimicoId)
    );
  }
}
