// Ponto de entrada da aplicação.
// Só junta as peças: repositórios reais + app HTTP, e sobe o servidor.
import { env } from "./config/env";
import { logger } from "./config/logger";
import { createApp } from "./api/app";
import { ProdutoRepositoryImpl } from "./infra/repositories/ProdutoRepositoryImpl";
import { CargaRepositoryImpl } from "./infra/repositories/CargaRepositoryImpl";
import { pool } from "./config/database"; // Ajusta o caminho se o teu pool estiver noutro ficheiro (ex: ./config/pool)

const app = createApp({
  produtoRepository: new ProdutoRepositoryImpl(pool),
  cargaRepository: new CargaRepositoryImpl(pool),
});

app.listen(env.port, () => {
  logger.info(`QuimiPort API rodando na porta ${env.port}`);
});