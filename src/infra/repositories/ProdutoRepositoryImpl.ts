// Implementação concreta do repositório de produtos químicos.
// Responsável: Amanda/Samuel

import { ProdutoRepository } from "../../application/repositories/ProdutoRepository";
import { ProdutoQuimico } from "../../domain/entities/ProdutoQuimico";

export class ProdutoRepositoryImpl implements ProdutoRepository {
  async criar(produto: ProdutoQuimico): Promise<ProdutoQuimico> {
    throw new Error("Não implementado.");
  }

  async buscarPorId(id: string): Promise<ProdutoQuimico | null> {
    throw new Error("Não implementado.");
  }

  async listar(): Promise<ProdutoQuimico[]> {
    throw new Error("Não implementado.");
  }

  async atualizar(id: string, dados: Partial<ProdutoQuimico>): Promise<ProdutoQuimico> {
    throw new Error("Não implementado.");
  }

  async inativar(id: string): Promise<void> {
    throw new Error("Não implementado.");
  }
}
