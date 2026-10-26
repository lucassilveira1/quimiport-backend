// Caso de uso: criar produto químico. Responsável: Paula

import { ClasseRiscoRepository } from "../../repositories/ClasseRiscoRepository";
import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { ProdutoQuimico, ProdutoQuimicoProps } from "../../../domain/entities/ProdutoQuimico";
import { resolverClasseRisco, resolverGrupos } from "./resolverReferencias";

/** Na entrada, a classe de risco vem pelo id e os grupos por código ou id. */
export type CriarProdutoInput = Omit<ProdutoQuimicoProps, "classeRisco" | "gruposCompatibilidade"> & {
  classeRisco: string;
  gruposCompatibilidade?: string[];
};

export class CriarProduto {
  constructor(
    private readonly produtoRepository: ProdutoRepository,
    private readonly classeRiscoRepository: ClasseRiscoRepository
  ) {}

  async executar(dados: CriarProdutoInput): Promise<ProdutoQuimico> {
    const classeRisco = await resolverClasseRisco(this.classeRiscoRepository, dados.classeRisco);
    const gruposCompatibilidade = await resolverGrupos(this.produtoRepository, dados.gruposCompatibilidade);

    const produto = ProdutoQuimico.criar({ ...dados, classeRisco, gruposCompatibilidade });
    return this.produtoRepository.criar(produto);
  }
}
