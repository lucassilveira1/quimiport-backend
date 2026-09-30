// Controller de cargas químicas. Responsável: Vitor
// Recebe a requisição, chama os casos de uso (Paula) e formata a resposta.

import { Request, Response } from "express";
import { RegistrarCarga } from "../../application/use-cases/carga/RegistrarCarga";
import { AtualizarStatusCarga } from "../../application/use-cases/carga/AtualizarStatusCarga";
import { BloquearCarga } from "../../application/use-cases/carga/BloquearCarga";
import { LiberarCarga } from "../../application/use-cases/carga/LiberarCarga";
import { CancelarCarga } from "../../application/use-cases/carga/CancelarCarga";
import { ListarCargas } from "../../application/use-cases/carga/ListarCargas";
import { BuscarCarga } from "../../application/use-cases/carga/BuscarCarga";
import { IdParamsDTO } from "../dtos/common.dto";
import { AtualizarStatusDTO, BloquearCargaDTO, ListarCargasQueryDTO, RegistrarCargaDTO } from "../dtos/carga.dto";
import { validated } from "../middlewares/validate";

export interface CargaControllerDeps {
  registrarCarga: RegistrarCarga;
  atualizarStatusCarga: AtualizarStatusCarga;
  bloquearCarga: BloquearCarga;
  liberarCarga: LiberarCarga;
  cancelarCarga: CancelarCarga;
  listarCargas: ListarCargas;
  buscarCarga: BuscarCarga;
}

export class CargaController {
  constructor(private readonly deps: CargaControllerDeps) {}

  registrar = async (_req: Request, res: Response): Promise<void> => {
    const dados = validated<RegistrarCargaDTO>(res, "body");
    const carga = await this.deps.registrarCarga.executar(dados);
    res.status(201).location(`/cargas-quimicas/${carga.id}`).json({ dados: carga });
  };

  listar = async (_req: Request, res: Response): Promise<void> => {
    const filtro = validated<ListarCargasQueryDTO>(res, "query");
    const cargas = await this.deps.listarCargas.executar(filtro);
    res.json({ dados: cargas, total: cargas.length });
  };

  buscarPorId = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    res.json({ dados: await this.deps.buscarCarga.executar(id) });
  };

  atualizarStatus = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    const { status } = validated<AtualizarStatusDTO>(res, "body");
    res.json({ dados: await this.deps.atualizarStatusCarga.executar(id, status) });
  };

  bloquear = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    const { motivo } = validated<BloquearCargaDTO>(res, "body");
    res.json({ dados: await this.deps.bloquearCarga.executar(id, motivo) });
  };

  liberar = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    res.json({ dados: await this.deps.liberarCarga.executar(id) });
  };

  cancelar = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    res.json({ dados: await this.deps.cancelarCarga.executar(id) });
  };
}
