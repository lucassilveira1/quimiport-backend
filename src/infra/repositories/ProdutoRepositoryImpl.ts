import { ProdutoRepository } from "../../application/repositories/ProdutoRepository";
import { ProdutoQuimico } from "../../domain/entities/ProdutoQuimico";
import { pool as db } from "../../config/database";

export class ProdutoRepositoryImpl implements ProdutoRepository {
  async listar(): Promise<ProdutoQuimico[]> {
    throw new Error("Método não implementado");
  }

  async criar(produto: ProdutoQuimico): Promise<ProdutoQuimico> {
    throw new Error("Método não implementado");
  }

  async buscarPorId(id: string): Promise<ProdutoQuimico | null> {
    throw new Error("Método não implementado");
  }

  async atualizar(id: string, produto: Partial<ProdutoQuimico>): Promise<ProdutoQuimico> {
    throw new Error("Método não implementado");
  }

  async inativar(id: string): Promise<void> {
    throw new Error("Método não implementado");
  }
}