// Controller de classes de risco (somente leitura).

import { Request, Response } from "express";
import { ListarClassesRisco } from "../../application/use-cases/classe-risco/ListarClassesRisco";

export interface ClasseRiscoControllerDeps {
  listarClassesRisco: ListarClassesRisco;
}

export class ClasseRiscoController {
  constructor(private readonly deps: ClasseRiscoControllerDeps) {}

  listar = async (_req: Request, res: Response): Promise<void> => {
    const classes = await this.deps.listarClassesRisco.executar();
    res.json({ dados: classes, total: classes.length });
  };
}
