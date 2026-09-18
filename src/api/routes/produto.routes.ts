// Rotas de produtos químicos. Responsável: Vitor
import { Router, Request, Response } from "express";

const router = Router();

// import { ProdutoController } from "../controllers/ProdutoController";

router.post("/", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));
router.get("/", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));
router.get("/:id", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));
router.put("/:id", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));
router.patch("/:id/inativar", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));

export default router;
