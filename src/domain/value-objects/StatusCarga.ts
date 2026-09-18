/**
 * Máquina de estados do status da carga química.
 * Responsável: Paula
 *
 * Fluxo principal:
 * registrada -> em_analise -> em_inspecao -> liberada -> em_movimentacao -> finalizada
 *
 * Fluxos alternativos:
 * registrada -> cancelada
 * em_analise -> cancelada
 * em_inspecao -> bloqueada
 * em_inspecao -> cancelada
 * liberada -> cancelada
 * bloqueada -> cancelada
 *
 * Estados terminais: finalizada, cancelada
 */

export type StatusCargaType =
  | "registrada"
  | "em_analise"
  | "em_inspecao"
  | "liberada"
  | "bloqueada"
  | "em_movimentacao"
  | "finalizada"
  | "cancelada";

export const TRANSICOES_PERMITIDAS: Record<StatusCargaType, StatusCargaType[]> = {
  registrada: ["em_analise", "cancelada"],
  em_analise: ["em_inspecao", "cancelada"],
  em_inspecao: ["liberada", "bloqueada", "cancelada"],
  liberada: ["em_movimentacao", "cancelada"],
  bloqueada: ["cancelada"],
  em_movimentacao: ["finalizada"],
  finalizada: [],
  cancelada: [],
};

export function podeTransicionar(statusAtual: StatusCargaType, novoStatus: StatusCargaType): boolean {
  const permitidos = TRANSICOES_PERMITIDAS[statusAtual];
  if (!permitidos) {
    throw new Error(`Status atual desconhecido: ${statusAtual}`);
  }
  return permitidos.includes(novoStatus);
}
