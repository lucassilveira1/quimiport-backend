// Caso de uso: atualizar produto químico. Responsável: Paula

import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { ProdutoQuimico } from "../../../domain/entities/ProdutoQuimico";

export class AtualizarProduto {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async executar(id: string, dadosAtualizados: Partial<ProdutoQuimico>): Promise<ProdutoQuimico> {
    // TODO: buscar produto, aplicar alterações e persistir
    throw new Error("Não implementado.");
  }
}
