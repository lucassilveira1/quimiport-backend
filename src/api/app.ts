// Montagem da aplicação HTTP. Responsável: Vitor
// Recebe os repositórios de fora (injeção de dependência):
// - no server.ts, entram os repositórios reais do PostgreSQL (Amanda/Samuel);
// - nos testes, entram repositórios em memória, sem precisar de banco.
import express, { Express } from "express";
import { ProdutoRepository } from "../application/repositories/ProdutoRepository";
import { CargaRepository } from "../application/repositories/CargaRepository";
import { CriarProduto } from "../application/use-cases/produto/CriarProduto";
import { AtualizarProduto } from "../application/use-cases/produto/AtualizarProduto";
import { InativarProduto } from "../application/use-cases/produto/InativarProduto";
import { ListarProdutos } from "../application/use-cases/produto/ListarProdutos";
import { BuscarProduto } from "../application/use-cases/produto/BuscarProduto";
import { RegistrarCarga } from "../application/use-cases/carga/RegistrarCarga";
import { AtualizarStatusCarga } from "../application/use-cases/carga/AtualizarStatusCarga";
import { BloquearCarga } from "../application/use-cases/carga/BloquearCarga";
import { LiberarCarga } from "../application/use-cases/carga/LiberarCarga";
import { CancelarCarga } from "../application/use-cases/carga/CancelarCarga";
import { ListarCargas } from "../application/use-cases/carga/ListarCargas";
import { BuscarCarga } from "../application/use-cases/carga/BuscarCarga";
import { ProdutoController } from "./controllers/ProdutoController";
import { CargaController } from "./controllers/CargaController";
import { produtoRoutes } from "./routes/produto.routes";
import { cargaRoutes } from "./routes/carga.routes";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

export interface AppDependencies {
  produtoRepository: ProdutoRepository;
  cargaRepository: CargaRepository;
}

export function createApp({ produtoRepository, cargaRepository }: AppDependencies): Express {
  const produtoController = new ProdutoController({
    criarProduto: new CriarProduto(produtoRepository),
    atualizarProduto: new AtualizarProduto(produtoRepository),
    inativarProduto: new InativarProduto(produtoRepository),
    listarProdutos: new ListarProdutos(produtoRepository),
    buscarProduto: new BuscarProduto(produtoRepository),
  });

  const cargaController = new CargaController({
    registrarCarga: new RegistrarCarga(cargaRepository, produtoRepository),
    atualizarStatusCarga: new AtualizarStatusCarga(cargaRepository),
    bloquearCarga: new BloquearCarga(cargaRepository),
    liberarCarga: new LiberarCarga(cargaRepository),
    cancelarCarga: new CancelarCarga(cargaRepository),
    listarCargas: new ListarCargas(cargaRepository),
    buscarCarga: new BuscarCarga(cargaRepository),
  });

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));
  app.use(requestLogger);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/produtos-quimicos", produtoRoutes(produtoController));
  app.use("/cargas-quimicas", cargaRoutes(cargaController));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
