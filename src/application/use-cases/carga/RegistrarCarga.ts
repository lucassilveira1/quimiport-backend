// Caso de uso: registrar carga química. Responsável: Paula
// Depende de ProdutoRepository (para checar se os produtos estão ativos),
// ResponsavelTecnicoRepository (para checar o responsável) e CargaRepository.

import { CargaRepository } from "../../repositories/CargaRepository";
import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { ResponsavelTecnicoRepository } from "../../repositories/ResponsavelTecnicoRepository";
import { CargaQuimica, CargaQuimicaProps, ProdutoDaCarga } from "../../../domain/entities/CargaQuimica";
import { DomainError } from "../../../domain/errors/DomainError";

/** Na entrada, os produtos e o responsável técnico vêm pelos ids. */
export type RegistrarCargaInput = Omit<CargaQuimicaProps, "produtos" | "responsavelTecnico"> & {
  produtos: string[];
  responsavelTecnico: string;
};

export class RegistrarCarga {
  constructor(
    private readonly cargaRepository: CargaRepository,
    private readonly produtoRepository: ProdutoRepository,
    private readonly responsavelTecnicoRepository: ResponsavelTecnicoRepository
  ) {}

  async executar(dados: RegistrarCargaInput): Promise<CargaQuimica> {
    const produtos: ProdutoDaCarga[] = [];
    for (const produtoId of new Set(dados.produtos)) {
      const produto = await this.produtoRepository.buscarPorId(produtoId);
      if (!produto) {
        throw new DomainError("PRODUTO_NAO_ENCONTRADO", `Produto químico não encontrado: ${produtoId}.`);
      }
      if (!produto.estaAtivo()) {
        throw new DomainError(
          "PRODUTO_INATIVO",
          `Não é possível registrar carga com produto químico inativo: ${produto.nome}.`
        );
      }
      produtos.push({
        id: produto.id,
        nome: produto.nome,
        numeroONU: produto.numeroONU,
        classeRisco: produto.classeRisco.codigo,
      });
    }

    const responsavel = await this.responsavelTecnicoRepository.buscarPorId(dados.responsavelTecnico);
    if (!responsavel) {
      throw new DomainError(
        "RESPONSAVEL_TECNICO_NAO_ENCONTRADO",
        `Responsável técnico não encontrado: ${dados.responsavelTecnico}.`
      );
    }
    const responsavelTecnico = { id: responsavel.id, nome: responsavel.nome };

    // Os produtos inativos já foram barrados acima, então aqui todos estão ativos.
    const carga = CargaQuimica.registrar({ ...dados, produtos, responsavelTecnico }, true);
    return this.cargaRepository.criar(carga);
  }
}
