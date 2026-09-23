// Caso de uso: atualizar produto químico. Responsável: Paula

import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { ProdutoQuimico, ProdutoQuimicoProps } from "../../../domain/entities/ProdutoQuimico";
import { DomainError } from "../../../domain/errors/DomainError";

export type AtualizarProdutoInput = Partial<
  Pick<ProdutoQuimicoProps, "nome" | "descricao" | "classeRisco" | "grupoCompatibilidade">
>;

export class AtualizarProduto {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async executar(id: string, dadosAtualizados: AtualizarProdutoInput): Promise<ProdutoQuimico> {
    const produto = await this.produtoRepository.buscarPorId(id);
    if (!produto) {
      throw new DomainError("PRODUTO_NAO_ENCONTRADO", "Produto químico não encontrado.");
    }
    produto.atualizarDados(dadosAtualizados);
    return this.produtoRepository.atualizar(id, dadosAtualizados);
  }
}
