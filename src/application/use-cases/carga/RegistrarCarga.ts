// Caso de uso: registrar carga química. Responsável: Paula
// Depende de ProdutoRepository (para checar se o produto está ativo) e CargaRepository.

import { CargaRepository } from "../../repositories/CargaRepository";
import { ProdutoRepository } from "../../repositories/ProdutoRepository";
import { CargaQuimica, CargaQuimicaProps } from "../../../domain/entities/CargaQuimica";
import { DomainError } from "../../../domain/errors/DomainError";

export class RegistrarCarga {
  constructor(
    private readonly cargaRepository: CargaRepository,
    private readonly produtoRepository: ProdutoRepository
  ) {}

  async executar(dados: CargaQuimicaProps): Promise<CargaQuimica> {
    const produto = await this.produtoRepository.buscarPorId(dados.produtoQuimicoId);
    if (!produto) {
      throw new DomainError("PRODUTO_NAO_ENCONTRADO", "Produto químico não encontrado.");
    }
    if (!produto.estaAtivo()) {
      throw new DomainError(
        "PRODUTO_INATIVO",
        "Não é possível registrar carga com produto químico inativo."
      );
    }

    const carga = CargaQuimica.registrar(dados, produto.estaAtivo());
    return this.cargaRepository.criar(carga);
  }
}
