// Controller de grupos de compatibilidade (somente leitura).

import { Request, Response } from "express";
import { ListarGruposCompatibilidade } from "../../application/use-cases/grupo-compatibilidade/ListarGruposCompatibilidade";

export interface GrupoCompatibilidadeControllerDeps {
  listarGruposCompatibilidade: ListarGruposCompatibilidade;
}

export class GrupoCompatibilidadeController {
  constructor(private readonly deps: GrupoCompatibilidadeControllerDeps) {}

  listar = async (_req: Request, res: Response): Promise<void> => {
    const grupos = await this.deps.listarGruposCompatibilidade.executar();
    res.json({ dados: grupos, total: grupos.length });
  };
}
