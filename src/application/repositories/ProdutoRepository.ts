// Contrato do repositório de produtos químicos.
// Implementado de fato em src/infra/repositories (Amanda/Samuel).
// Responsável pela interface: Paula (combinada com Amanda/Samuel)

import { ProdutoQuimico } from "../../domain/entities/ProdutoQuimico";

export interface ProdutoRepository {
  criar(produto: ProdutoQuimico): Promise<ProdutoQuimico>;
  buscarPorId(id: string): Promise<ProdutoQuimico | null>;
  listar(): Promise<ProdutoQuimico[]>;
  atualizar(id: string, dados: Partial<ProdutoQuimico>): Promise<ProdutoQuimico>;
  inativar(id: string): Promise<void>;
}
