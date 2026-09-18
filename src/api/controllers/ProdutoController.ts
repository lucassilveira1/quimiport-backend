// Controller de produtos químicos. Responsável: Vitor
// Recebe a requisição, chama os casos de uso (Paula) e formata a resposta.

import { Request, Response } from "express";
import { CriarProduto } from "../../application/use-cases/produto/CriarProduto";
import { AtualizarProduto } from "../../application/use-cases/produto/AtualizarProduto";
import { InativarProduto } from "../../application/use-cases/produto/InativarProduto";

interface ProdutoControllerDeps {
  criarProduto: CriarProduto;
  atualizarProduto: AtualizarProduto;
  inativarProduto: InativarProduto;
}

export class ProdutoController {
  constructor(private readonly deps: ProdutoControllerDeps) {}

  async criar(req: Request, res: Response): Promise<void> {
    // TODO
  }
}
