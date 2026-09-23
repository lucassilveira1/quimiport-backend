// Caso de uso: criar produto químico. Responsável: Paula

import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { ProdutoQuimico, ProdutoQuimicoProps } from "../../../domain/entities/ProdutoQuimico";

export class CriarProduto {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async executar(dados: ProdutoQuimicoProps): Promise<ProdutoQuimico> {
    const produto = ProdutoQuimico.criar(dados);
    return this.produtoRepository.criar(produto);
  }
}
