// Converte os ids/códigos recebidos na API nas referências usadas pelo domínio.
// Usado por CriarProduto e AtualizarProduto.

import { ClasseRiscoRepository } from "../../repositories/ClasseRiscoRepository";
import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { Referencia } from "../../../domain/value-objects/Referencia";
import { DomainError } from "../../../domain/errors/DomainError";

export async function resolverClasseRisco(
  classeRiscoRepository: ClasseRiscoRepository,
  id: string
): Promise<Referencia> {
  const classe = await classeRiscoRepository.buscarPorId(id);
  if (!classe) {
    throw new DomainError("CLASSE_RISCO_NAO_ENCONTRADA", `Classe de risco não encontrada: ${id}.`);
  }
  return classe;
}

export async function resolverGrupos(
  produtoRepository: ProdutoRepository,
  referencias: string[] | undefined
): Promise<Referencia[] | undefined> {
  if (referencias === undefined) return undefined;
  return produtoRepository.obterGrupos([...new Set(referencias)]);
}
