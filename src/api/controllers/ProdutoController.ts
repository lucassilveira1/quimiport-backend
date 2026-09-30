// Controller de produtos químicos. Responsável: Vitor
// Controller "fino": não tem regra de negócio. Lê a entrada já validada,
// chama o caso de uso (Paula) e formata a resposta. Erros vão para o errorHandler.

import { Request, Response } from "express";
import { CriarProduto } from "../../application/use-cases/produto/CriarProduto";
import { AtualizarProduto } from "../../application/use-cases/produto/AtualizarProduto";
import { InativarProduto } from "../../application/use-cases/produto/InativarProduto";
import { ListarProdutos } from "../../application/use-cases/produto/ListarProdutos";
import { BuscarProduto } from "../../application/use-cases/produto/BuscarProduto";
import { IdParamsDTO } from "../dtos/common.dto";
import { AtualizarProdutoDTO, CriarProdutoDTO, ListarProdutosQueryDTO } from "../dtos/produto.dto";
import { validated } from "../middlewares/validate";

export interface ProdutoControllerDeps {
  criarProduto: CriarProduto;
  atualizarProduto: AtualizarProduto;
  inativarProduto: InativarProduto;
  listarProdutos: ListarProdutos;
  buscarProduto: BuscarProduto;
}

export class ProdutoController {
  constructor(private readonly deps: ProdutoControllerDeps) {}

  criar = async (_req: Request, res: Response): Promise<void> => {
    const dados = validated<CriarProdutoDTO>(res, "body");
    const produto = await this.deps.criarProduto.executar(dados);
    res.status(201).location(`/produtos-quimicos/${produto.id}`).json({ dados: produto });
  };

  listar = async (_req: Request, res: Response): Promise<void> => {
    const filtro = validated<ListarProdutosQueryDTO>(res, "query");
    const produtos = await this.deps.listarProdutos.executar(filtro);
    res.json({ dados: produtos, total: produtos.length });
  };

  buscarPorId = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    res.json({ dados: await this.deps.buscarProduto.executar(id) });
  };

  atualizar = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    const dados = validated<AtualizarProdutoDTO>(res, "body");
    res.json({ dados: await this.deps.atualizarProduto.executar(id, dados) });
  };

  inativar = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    await this.deps.inativarProduto.executar(id);
    res.status(204).send();
  };
}
