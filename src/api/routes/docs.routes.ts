// Rotas da documentação da API: Swagger UI em /docs e o contrato em /docs/openapi.json.
// A fonte é o docs/openapi.yaml (caminho relativo à raiz do projeto, como as migrations).
import { readFileSync } from "fs";
import path from "path";
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";

const CAMINHO_OPENAPI = path.resolve("docs/openapi.yaml");

let contrato: Record<string, unknown> | undefined;

/** Lê o YAML uma vez só e reaproveita nas próximas chamadas. */
function carregarContrato(): Record<string, unknown> {
  contrato ??= parse(readFileSync(CAMINHO_OPENAPI, "utf8"));
  return contrato!;
}

export function docsRoutes(): Router {
  const router = Router();
  const openapi = carregarContrato();

  router.get("/openapi.json", (_req, res) => res.json(openapi));
  router.use("/", swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: "QuimiPort API" }));

  return router;
}
