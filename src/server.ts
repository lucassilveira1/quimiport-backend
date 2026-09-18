// Ponto de entrada da aplicação.
import express from "express";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { requestLogger } from "./api/middlewares/requestLogger";
import { errorHandler } from "./api/middlewares/errorHandler";
import produtoRoutes from "./api/routes/produto.routes";
import cargaRoutes from "./api/routes/carga.routes";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use("/produtos-quimicos", produtoRoutes);
app.use("/cargas-quimicas", cargaRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(`QuimiPort API rodando na porta ${env.port}`);
});
