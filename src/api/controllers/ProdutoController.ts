import { Request, Response } from "express";
import { CriarProdutoQuimico } from "../../application/use-cases/produto/CriarProduto";
import { AtualizarProduto } from "../../application/use-cases/produto/AtualizarProduto";
import { InativarProduto } from "../../application/use-cases/produto/InativarProduto";
import { ListarProdutos } from "../../application/use-cases/produto/ListarProdutos";
import { BuscarProduto } from "../../application/use-cases/produto/BuscarProduto";
import { IdParamsDTO } from "../dtos/common.dto";
import { CriarProdutoDTO, AtualizarProdutoDTO, ListarProdutosQueryDTO } from "../dtos/produto.dto";
import { validated } from "../middlewares/validate";

export interface ProdutoControllerDeps {
  criarProduto: CriarProdutoQuimico;
  atualizarProduto: AtualizarProduto;
  inativarProduto?: InativarProduto;
  listarProdutos?: ListarProdutos;
  buscarProduto?: BuscarProduto;
}

export class ProdutoController {
  constructor(private readonly deps: ProdutoControllerDeps) {}

  criar = async (_req: Request, res: Response): Promise<void> => {
    const dados = validated<CriarProdutoDTO>(res, "body");
    const produto = await this.deps.criarProduto.executar(dados);
    res.status(201).json({ dados: produto });
  };

  atualizar = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    const dados = validated<AtualizarProdutoDTO>(res, "body");
    res.json({ dados: await this.deps.atualizarProduto.executar(id, dados) });
  };

  inativar = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    if (this.deps.inativarProduto) {
      res.json({ dados: await this.deps.inativarProduto.executar(id) });
    }
  };

  listar = async (_req: Request, res: Response): Promise<void> => {
    const filtro = validated<ListarProdutosQueryDTO>(res, "query");
    if (this.deps.listarProdutos) {
      const produtos = await this.deps.listarProdutos.executar(filtro);
      res.json({ dados: produtos, total: produtos.length });
    }
  };

  buscarPorId = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    if (this.deps.buscarProduto) {
      res.json({ dados: await this.deps.buscarProduto.executar(id) });
    }
  };
}