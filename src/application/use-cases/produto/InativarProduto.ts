// Caso de uso: inativar produto químico. Responsável: Paula

import { ProdutoRepository } from "../../repositories/ProdutoRepository";

export class InativarProduto {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async executar(id: string): Promise<void> {
    // TODO: buscar produto, chamar produto.inativar() e persistir
    throw new Error("Não implementado.");
  }
}
