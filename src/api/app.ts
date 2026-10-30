// Montagem da aplicação HTTP. Responsável: Vitor
// Recebe os repositórios de fora (injeção de dependência):
// - no server.ts, entram os repositórios reais do PostgreSQL (Amanda/Samuel);
// - nos testes, entram repositórios em memória, sem precisar de banco.
import express, { Express } from "express";
import { ProdutoRepository } from "../application/repositories/ProdutoRepository";
import { CargaRepository } from "../application/repositories/CargaRepository";
import { ClasseRiscoRepository } from "../application/repositories/ClasseRiscoRepository";
import { GrupoCompatibilidadeRepository } from "../application/repositories/GrupoCompatibilidadeRepository";
import { ResponsavelTecnicoRepository } from "../application/repositories/ResponsavelTecnicoRepository";
import { CriarProduto } from "../application/use-cases/produto/CriarProduto";
import { AtualizarProduto } from "../application/use-cases/produto/AtualizarProduto";
import { InativarProduto } from "../application/use-cases/produto/InativarProduto";
import { AtivarProduto } from "../application/use-cases/produto/AtivarProduto";
import { ListarProdutos } from "../application/use-cases/produto/ListarProdutos";
import { BuscarProduto } from "../application/use-cases/produto/BuscarProduto";
import { RegistrarCarga } from "../application/use-cases/carga/RegistrarCarga";
import { AtualizarStatusCarga } from "../application/use-cases/carga/AtualizarStatusCarga";
import { BloquearCarga } from "../application/use-cases/carga/BloquearCarga";
import { LiberarCarga } from "../application/use-cases/carga/LiberarCarga";
import { CancelarCarga } from "../application/use-cases/carga/CancelarCarga";
import { ListarCargas } from "../application/use-cases/carga/ListarCargas";
import { BuscarCarga } from "../application/use-cases/carga/BuscarCarga";
import { ListarClassesRisco } from "../application/use-cases/classe-risco/ListarClassesRisco";
import { ListarGruposCompatibilidade } from "../application/use-cases/grupo-compatibilidade/ListarGruposCompatibilidade";
import { CriarResponsavelTecnico } from "../application/use-cases/responsavel-tecnico/CriarResponsavelTecnico";
import { ListarResponsaveisTecnicos } from "../application/use-cases/responsavel-tecnico/ListarResponsaveisTecnicos";
import { BuscarResponsavelTecnico } from "../application/use-cases/responsavel-tecnico/BuscarResponsavelTecnico";
import { ProdutoController } from "./controllers/ProdutoController";
import { CargaController } from "./controllers/CargaController";
import { ClasseRiscoController } from "./controllers/ClasseRiscoController";
import { GrupoCompatibilidadeController } from "./controllers/GrupoCompatibilidadeController";
import { ResponsavelTecnicoController } from "./controllers/ResponsavelTecnicoController";
import { produtoRoutes } from "./routes/produto.routes";
import { cargaRoutes } from "./routes/carga.routes";
import { classeRiscoRoutes } from "./routes/classeRisco.routes";
import { grupoCompatibilidadeRoutes } from "./routes/grupoCompatibilidade.routes";
import { responsavelTecnicoRoutes } from "./routes/responsavelTecnico.routes";
import { docsRoutes } from "./routes/docs.routes";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

export interface AppDependencies {
  produtoRepository: ProdutoRepository;
  cargaRepository: CargaRepository;
  classeRiscoRepository: ClasseRiscoRepository;
  grupoCompatibilidadeRepository: GrupoCompatibilidadeRepository;
  responsavelTecnicoRepository: ResponsavelTecnicoRepository;
}

export function createApp({
  produtoRepository,
  cargaRepository,
  classeRiscoRepository,
  grupoCompatibilidadeRepository,
  responsavelTecnicoRepository,
}: AppDependencies): Express {
  const produtoController = new ProdutoController({
    criarProduto: new CriarProduto(produtoRepository, classeRiscoRepository, grupoCompatibilidadeRepository),
    atualizarProduto: new AtualizarProduto(produtoRepository, classeRiscoRepository, grupoCompatibilidadeRepository),
    inativarProduto: new InativarProduto(produtoRepository),
    ativarProduto: new AtivarProduto(produtoRepository),
    listarProdutos: new ListarProdutos(produtoRepository),
    buscarProduto: new BuscarProduto(produtoRepository),
  });

  const cargaController = new CargaController({
    registrarCarga: new RegistrarCarga(cargaRepository, produtoRepository, responsavelTecnicoRepository),
    atualizarStatusCarga: new AtualizarStatusCarga(cargaRepository),
    bloquearCarga: new BloquearCarga(cargaRepository),
    liberarCarga: new LiberarCarga(cargaRepository),
    cancelarCarga: new CancelarCarga(cargaRepository),
    listarCargas: new ListarCargas(cargaRepository),
    buscarCarga: new BuscarCarga(cargaRepository),
  });

  const classeRiscoController = new ClasseRiscoController({
    listarClassesRisco: new ListarClassesRisco(classeRiscoRepository),
  });

  const grupoCompatibilidadeController = new GrupoCompatibilidadeController({
    listarGruposCompatibilidade: new ListarGruposCompatibilidade(grupoCompatibilidadeRepository),
  });

  const responsavelTecnicoController = new ResponsavelTecnicoController({
    criarResponsavelTecnico: new CriarResponsavelTecnico(responsavelTecnicoRepository),
    listarResponsaveisTecnicos: new ListarResponsaveisTecnicos(responsavelTecnicoRepository),
    buscarResponsavelTecnico: new BuscarResponsavelTecnico(responsavelTecnicoRepository),
  });

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));
  app.use(requestLogger);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/docs", docsRoutes());
  app.use("/produtos-quimicos", produtoRoutes(produtoController));
  app.use("/cargas-quimicas", cargaRoutes(cargaController));
  app.use("/classes-risco", classeRiscoRoutes(classeRiscoController));
  app.use("/grupos-compatibilidade", grupoCompatibilidadeRoutes(grupoCompatibilidadeController));
  app.use("/responsaveis-tecnicos", responsavelTecnicoRoutes(responsavelTecnicoController));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
