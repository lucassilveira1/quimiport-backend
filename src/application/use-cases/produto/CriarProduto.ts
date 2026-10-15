import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { ProdutoQuimico, ProdutoQuimicoProps } from "../../../domain/entities/ProdutoQuimico";

export class CriarProdutoQuimico {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async executar(dados: ProdutoQuimicoProps): Promise<ProdutoQuimico> {
    const produto = ProdutoQuimico.criar(dados);
    return this.produtoRepository.criar(produto);
  }
}