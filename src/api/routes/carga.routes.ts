// Rotas de cargas químicas. Responsável: Vitor
import { Router } from "express";
import { CargaController } from "../controllers/CargaController";
import { atualizarStatusSchema, bloquearCargaSchema, listarCargasQuerySchema, registrarCargaSchema } from "../dtos/carga.dto";
import { idParamsSchema } from "../dtos/common.dto";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validate } from "../middlewares/validate";

export function cargaRoutes(controller: CargaController): Router {
  const router = Router();
  const params = idParamsSchema;

  router.post("/", validate({ body: registrarCargaSchema }), asyncHandler(controller.registrar));
  router.get("/", validate({ query: listarCargasQuerySchema }), asyncHandler(controller.listar));
  router.get("/:id", validate({ params }), asyncHandler(controller.buscarPorId));
  router.patch("/:id/status", validate({ params, body: atualizarStatusSchema }), asyncHandler(controller.atualizarStatus));
  router.patch("/:id/bloquear", validate({ params, body: bloquearCargaSchema }), asyncHandler(controller.bloquear));
  router.patch("/:id/liberar", validate({ params }), asyncHandler(controller.liberar));
  router.patch("/:id/cancelar", validate({ params }), asyncHandler(controller.cancelar));

  return router;
}
