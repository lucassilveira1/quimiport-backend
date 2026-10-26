// Caso de uso: reativar produto químico inativo.

import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { DomainError } from "../../../domain/errors/DomainError";

export class AtivarProduto {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async executar(id: string): Promise<void> {
    const produto = await this.produtoRepository.buscarPorId(id);
    if (!produto) {
      throw new DomainError("PRODUTO_NAO_ENCONTRADO", "Produto químico não encontrado.");
    }
    produto.ativar();
    await this.produtoRepository.ativar(id);
  }
}
