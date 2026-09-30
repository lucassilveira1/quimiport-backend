// Ponto de entrada da aplicação.
// Só junta as peças: repositórios reais + app HTTP, e sobe o servidor.
import { env } from "./config/env";
import { logger } from "./config/logger";
import { createApp } from "./api/app";
import { ProdutoRepositoryImpl } from "./infra/repositories/ProdutoRepositoryImpl";
import { CargaRepositoryImpl } from "./infra/repositories/CargaRepositoryImpl";

const app = createApp({
  produtoRepository: new ProdutoRepositoryImpl(),
  cargaRepository: new CargaRepositoryImpl(),
});

app.listen(env.port, () => {
  logger.info(`QuimiPort API rodando na porta ${env.port}`);
});
