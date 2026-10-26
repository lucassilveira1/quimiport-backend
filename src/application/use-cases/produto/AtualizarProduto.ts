// Caso de uso: atualizar produto químico. Responsável: Paula

import { ClasseRiscoRepository } from "../../repositories/ClasseRiscoRepository";
import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { ProdutoQuimico } from "../../../domain/entities/ProdutoQuimico";
import { DomainError } from "../../../domain/errors/DomainError";
import { resolverClasseRisco, resolverGrupos } from "./resolverReferencias";

/** Na entrada, a classe de risco vem pelo id e os grupos por código ou id. */
export interface AtualizarProdutoInput {
  nome?: string;
  descricao?: string;
  classeRisco?: string;
  gruposCompatibilidade?: string[];
}

export class AtualizarProduto {
  constructor(
    private readonly produtoRepository: ProdutoRepository,
    private readonly classeRiscoRepository: ClasseRiscoRepository
  ) {}

  async executar(id: string, dadosAtualizados: AtualizarProdutoInput): Promise<ProdutoQuimico> {
    const produto = await this.produtoRepository.buscarPorId(id);
    if (!produto) {
      throw new DomainError("PRODUTO_NAO_ENCONTRADO", "Produto químico não encontrado.");
    }

    const classeRisco =
      dadosAtualizados.classeRisco !== undefined
        ? await resolverClasseRisco(this.classeRiscoRepository, dadosAtualizados.classeRisco)
        : undefined;
    const gruposCompatibilidade = await resolverGrupos(
      this.produtoRepository,
      dadosAtualizados.gruposCompatibilidade
    );

    const dados = {
      nome: dadosAtualizados.nome,
      descricao: dadosAtualizados.descricao,
      classeRisco,
      gruposCompatibilidade,
    };
    produto.atualizarDados(dados);
    return this.produtoRepository.atualizar(id, dados);
  }
}
