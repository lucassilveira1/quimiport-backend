// Rotas de produtos químicos. Responsável: Vitor
// Cada rota: 1) valida a entrada (DTO)  2) chama o controller.
import { Router } from "express";
import { ProdutoController } from "../controllers/ProdutoController";
import { idParamsSchema } from "../dtos/common.dto";
import { atualizarProdutoSchema, criarProdutoSchema, listarProdutosQuerySchema } from "../dtos/produto.dto";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validate } from "../middlewares/validate";

export function produtoRoutes(controller: ProdutoController): Router {
  const router = Router();
  const params = idParamsSchema;

  router.post("/", validate({ body: criarProdutoSchema }), asyncHandler(controller.criar));
  router.get("/", validate({ query: listarProdutosQuerySchema }), asyncHandler(controller.listar));
  router.get("/:id", validate({ params }), asyncHandler(controller.buscarPorId));
  router.put("/:id", validate({ params, body: atualizarProdutoSchema }), asyncHandler(controller.atualizar));
  router.patch("/:id/inativar", validate({ params }), asyncHandler(controller.inativar));

  return router;
}
