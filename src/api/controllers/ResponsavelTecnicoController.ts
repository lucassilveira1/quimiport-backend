// Controller de responsáveis técnicos.
// Lê a entrada já validada, chama o caso de uso e formata a resposta.

import { Request, Response } from "express";
import { CriarResponsavelTecnico } from "../../application/use-cases/responsavel-tecnico/CriarResponsavelTecnico";
import { ListarResponsaveisTecnicos } from "../../application/use-cases/responsavel-tecnico/ListarResponsaveisTecnicos";
import { BuscarResponsavelTecnico } from "../../application/use-cases/responsavel-tecnico/BuscarResponsavelTecnico";
import { IdParamsDTO } from "../dtos/common.dto";
import { CriarResponsavelTecnicoDTO } from "../dtos/responsavelTecnico.dto";
import { validated } from "../middlewares/validate";

export interface ResponsavelTecnicoControllerDeps {
  criarResponsavelTecnico: CriarResponsavelTecnico;
  listarResponsaveisTecnicos: ListarResponsaveisTecnicos;
  buscarResponsavelTecnico: BuscarResponsavelTecnico;
}

export class ResponsavelTecnicoController {
  constructor(private readonly deps: ResponsavelTecnicoControllerDeps) {}

  criar = async (_req: Request, res: Response): Promise<void> => {
    const dados = validated<CriarResponsavelTecnicoDTO>(res, "body");
    const responsavel = await this.deps.criarResponsavelTecnico.executar(dados);
    res.status(201).location(`/responsaveis-tecnicos/${responsavel.id}`).json({ dados: responsavel });
  };

  listar = async (_req: Request, res: Response): Promise<void> => {
    const responsaveis = await this.deps.listarResponsaveisTecnicos.executar();
    res.json({ dados: responsaveis, total: responsaveis.length });
  };

  buscarPorId = async (_req: Request, res: Response): Promise<void> => {
    const { id } = validated<IdParamsDTO>(res, "params");
    res.json({ dados: await this.deps.buscarResponsavelTecnico.executar(id) });
  };
}
