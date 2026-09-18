// Controller de cargas químicas. Responsável: Vitor
// Recebe a requisição, chama os casos de uso (Paula) e formata a resposta.

import { Request, Response } from "express";
import { RegistrarCarga } from "../../application/use-cases/carga/RegistrarCarga";
import { AtualizarStatusCarga } from "../../application/use-cases/carga/AtualizarStatusCarga";
import { BloquearCarga } from "../../application/use-cases/carga/BloquearCarga";
import { LiberarCarga } from "../../application/use-cases/carga/LiberarCarga";
import { CancelarCarga } from "../../application/use-cases/carga/CancelarCarga";

interface CargaControllerDeps {
  registrarCarga: RegistrarCarga;
  atualizarStatusCarga: AtualizarStatusCarga;
  bloquearCarga: BloquearCarga;
  liberarCarga: LiberarCarga;
  cancelarCarga: CancelarCarga;
}

export class CargaController {
  constructor(private readonly deps: CargaControllerDeps) {}

  async registrar(req: Request, res: Response): Promise<void> {
    // TODO
  }
}
