// Rotas de responsáveis técnicos.
import { Router } from "express";
import { ResponsavelTecnicoController } from "../controllers/ResponsavelTecnicoController";
import { idParamsSchema } from "../dtos/common.dto";
import { criarResponsavelTecnicoSchema } from "../dtos/responsavelTecnico.dto";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validate } from "../middlewares/validate";

export function responsavelTecnicoRoutes(controller: ResponsavelTecnicoController): Router {
  const router = Router();
  const params = idParamsSchema;

  router.post("/", validate({ body: criarResponsavelTecnicoSchema }), asyncHandler(controller.criar));
  router.get("/", asyncHandler(controller.listar));
  router.get("/:id", validate({ params }), asyncHandler(controller.buscarPorId));

  return router;
}
