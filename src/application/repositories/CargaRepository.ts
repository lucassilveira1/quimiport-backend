// Contrato do repositório de cargas químicas.
// Implementado de fato em src/infra/repositories (Amanda/Samuel).
// Responsável pela interface: Paula (combinada com Amanda/Samuel)

import { CargaQuimica } from "../../domain/entities/CargaQuimica";
import { StatusCargaType } from "../../domain/value-objects/StatusCarga";

export interface CargaRepository {
  criar(carga: CargaQuimica): Promise<CargaQuimica>;
  buscarPorId(id: string): Promise<CargaQuimica | null>;
  listar(): Promise<CargaQuimica[]>;
  atualizarStatus(id: string, novoStatus: StatusCargaType): Promise<CargaQuimica>;
}
