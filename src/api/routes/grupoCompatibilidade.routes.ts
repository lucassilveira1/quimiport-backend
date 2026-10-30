// Rotas de grupos de compatibilidade (somente leitura: o cadastro vem do seed da migration 0003).
import { Router } from "express";
import { GrupoCompatibilidadeController } from "../controllers/GrupoCompatibilidadeController";
import { asyncHandler } from "../middlewares/asyncHandler";

export function grupoCompatibilidadeRoutes(controller: GrupoCompatibilidadeController): Router {
  const router = Router();

  router.get("/", asyncHandler(controller.listar));

  return router;
}
