// Caso de uso: buscar produto químico por id.
// Criado por Vitor para o endpoint GET /produtos-quimicos/:id — Paula, favor revisar.

import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { ProdutoQuimico } from "../../../domain/entities/ProdutoQuimico";
import { DomainError } from "../../../domain/errors/DomainError";

export class BuscarProduto {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async executar(id: string): Promise<ProdutoQuimico> {
    const produto = await this.produtoRepository.buscarPorId(id);
    if (!produto) {
      throw new DomainError("PRODUTO_NAO_ENCONTRADO", "Produto químico não encontrado.");
    }
    return produto;
  }
}
