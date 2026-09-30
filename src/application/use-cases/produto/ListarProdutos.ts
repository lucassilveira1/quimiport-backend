// Caso de uso: listar produtos químicos.
// Criado por Vitor para o endpoint GET /produtos-quimicos — Paula, favor revisar.

import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { ProdutoQuimico } from "../../../domain/entities/ProdutoQuimico";
import { StatusProduto } from "../../../domain/enums/StatusProduto";

export interface ListarProdutosFiltro {
  status?: StatusProduto;
}

export class ListarProdutos {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async executar(filtro: ListarProdutosFiltro = {}): Promise<ProdutoQuimico[]> {
    const produtos = await this.produtoRepository.listar();
    return filtro.status ? produtos.filter((p) => p.status === filtro.status) : produtos;
  }
}
