// Rotas de classes de risco (somente leitura: o cadastro vem do seed da migration 0002).
import { Router } from "express";
import { ClasseRiscoController } from "../controllers/ClasseRiscoController";
import { asyncHandler } from "../middlewares/asyncHandler";

export function classeRiscoRoutes(controller: ClasseRiscoController): Router {
  const router = Router();

  router.get("/", asyncHandler(controller.listar));

  return router;
}
