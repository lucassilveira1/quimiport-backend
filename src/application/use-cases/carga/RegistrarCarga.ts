// Caso de uso: registrar carga química. Responsável: Paula / Amanda
// Depende de ProdutoRepository (para checar se os produtos estão ativos) e CargaRepository.

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
    if (!dados.produtosQuimicosIds || dados.produtosQuimicosIds.length === 0) {
      throw new DomainError("PRODUTO_OBRIGATORIO", "É necessário informar ao menos um produto químico.");
    }

    let todosProdutosAtivos = true;

    // Valida cada produto do array de produtosQuimicosIds
    for (const produtoId of dados.produtosQuimicosIds) {
      const produto = await this.produtoRepository.buscarPorId(produtoId);

      if (!produto) {
        throw new DomainError("PRODUTO_NAO_ENCONTRADO", `Produto químico ID ${produtoId} não encontrado.`);
      }

      if (!produto.estaAtivo()) {
        todosProdutosAtivos = false;
        throw new DomainError(
          "PRODUTO_INATIVO",
          `Não é possível registrar carga com produto químico inativo (ID: ${produtoId}).`
        );
      }
    }

    // Registra a carga com a validação completa dos produtos
    const carga = CargaQuimica.registrar(dados, todosProdutosAtivos);

    return this.cargaRepository.criar(carga);
  }
}