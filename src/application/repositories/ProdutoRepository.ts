// Contrato do repositório de produtos químicos.
// Implementado de fato em src/infra/repositories (Amanda/Samuel).
// Responsável pela interface: Paula (combinada com Amanda/Samuel)

import { ProdutoQuimico } from "../../domain/entities/ProdutoQuimico";
import { Referencia } from "../../domain/value-objects/Referencia";

export interface ProdutoRepository {
  criar(produto: ProdutoQuimico): Promise<ProdutoQuimico>;
  buscarPorId(id: string): Promise<ProdutoQuimico | null>;
  listar(): Promise<ProdutoQuimico[]>;
  atualizar(id: string, dados: Partial<ProdutoQuimico>): Promise<ProdutoQuimico>;
  inativar(id: string): Promise<void>;
  ativar(id: string): Promise<void>;
  /**
   * Converte códigos ("G1") ou ids de grupos de compatibilidade nos grupos.
   * Código inexistente cria o grupo; id inexistente lança
   * GRUPO_COMPATIBILIDADE_NAO_ENCONTRADO.
   */
  obterGrupos(referencias: string[]): Promise<Referencia[]>;
}
