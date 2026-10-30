// Converte os ids/códigos recebidos na API nas referências usadas pelo domínio.
// Usado por CriarProduto e AtualizarProduto.

import { ClasseRiscoRepository } from "../../repositories/ClasseRiscoRepository";
import { GrupoCompatibilidadeRepository } from "../../repositories/GrupoCompatibilidadeRepository";
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

/** Cada grupo vem pelo id ou pelo código ("G1") e precisa estar cadastrado. */
export async function resolverGrupos(
  grupoCompatibilidadeRepository: GrupoCompatibilidadeRepository,
  referencias: string[] | undefined
): Promise<Referencia[] | undefined> {
  if (referencias === undefined) return undefined;

  const grupos: Referencia[] = [];
  for (const referencia of new Set(referencias)) {
    const grupo = await grupoCompatibilidadeRepository.buscarPorReferencia(referencia);
    if (!grupo) {
      throw new DomainError(
        "GRUPO_COMPATIBILIDADE_NAO_ENCONTRADO",
        `Grupo de compatibilidade não encontrado: ${referencia}.`
      );
    }
    grupos.push(grupo);
  }
  return grupos;
}
