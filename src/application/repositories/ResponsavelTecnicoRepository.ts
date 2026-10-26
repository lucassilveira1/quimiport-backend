// Contrato do repositório de responsáveis técnicos.

import { ResponsavelTecnico } from "../../domain/entities/ResponsavelTecnico";

export interface ResponsavelTecnicoRepository {
  criar(responsavel: ResponsavelTecnico): Promise<ResponsavelTecnico>;
  /** Busca o responsável técnico pelo id; null se não existir. */
  buscarPorId(id: string): Promise<ResponsavelTecnico | null>;
  listar(): Promise<ResponsavelTecnico[]>;
}
