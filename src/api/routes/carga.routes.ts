// Rotas de cargas químicas. Responsável: Vitor
import { Router, Request, Response } from "express";

const router = Router();

// import { CargaController } from "../controllers/CargaController";

router.post("/", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));
router.get("/", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));
router.get("/:id", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));
router.patch("/:id/status", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));
router.patch("/:id/bloquear", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));
router.patch("/:id/liberar", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));
router.patch("/:id/cancelar", (req: Request, res: Response) => res.status(501).json({ message: "Não implementado." }));

export default router;
