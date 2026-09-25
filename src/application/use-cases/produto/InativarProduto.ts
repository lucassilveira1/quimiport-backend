// Caso de uso: inativar produto químico. Responsável: Paula

import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { DomainError } from "../../../domain/errors/DomainError";

export class InativarProduto {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async executar(id: string): Promise<void> {
    const produto = await this.produtoRepository.buscarPorId(id);
    if (!produto) {
      throw new DomainError("PRODUTO_NAO_ENCONTRADO", "Produto químico não encontrado.");
    }
    produto.inativar();
    await this.produtoRepository.inativar(id);
  }
}
