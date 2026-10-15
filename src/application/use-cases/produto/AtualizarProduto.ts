import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { ProdutoQuimico, ProdutoQuimicoProps } from "../../../domain/entities/ProdutoQuimico";

export type AtualizarProdutoDados = Partial<
  Pick<ProdutoQuimicoProps, "nome" | "descricao" | "classeRiscoId" | "grupoCompatibilidadeId">
>;

export class AtualizarProduto {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async executar(id: string, dados: AtualizarProdutoDados): Promise<ProdutoQuimico> {
    return this.produtoRepository.atualizar(id, dados);
  }
}