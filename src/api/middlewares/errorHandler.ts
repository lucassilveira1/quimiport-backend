// Middleware de tratamento de erros. Responsável: Vitor
// Único lugar da aplicação que decide o status HTTP de cada erro.
import { NextFunction, Request, Response } from "express";
import { DomainError } from "../../domain/errors/DomainError";
import { logger } from "../../config/logger";
import { RequestValidationError } from "../errors/RequestValidationError";

/**
 * Tradução dos códigos do DomainError (Paula) para status HTTP.
 * Código novo no domínio que não estiver aqui → 422 (regra de negócio).
 */
export const STATUS_POR_CODIGO: Record<string, number> = {
  // 400: dado de entrada inválido
  NOME_OBRIGATORIO: 400,
  CLASSE_RISCO_INVALIDA: 400,
  STATUS_INVALIDO: 400,
  PRODUTO_OBRIGATORIO: 400,
  QUANTIDADE_INVALIDA: 400,
  RESPONSAVEL_TECNICO_OBRIGATORIO: 400,
  // 404: recurso não existe
  PRODUTO_NAO_ENCONTRADO: 404,
  CARGA_NAO_ENCONTRADA: 404,
  // 409: conflito com o estado atual
  PRODUTO_JA_INATIVO: 409,
  // 422: regra de negócio violada
  PRODUTO_INATIVO: 422,
  TRANSICAO_INVALIDA: 422,
  DOCUMENTACAO_INCOMPLETA: 422,
};

const corpoErro = (codigo: string, mensagem: string, detalhes?: unknown) => ({
  erro: detalhes === undefined ? { codigo, mensagem } : { codigo, mensagem, detalhes },
});

const emTeste = process.env.NODE_ENV === "test";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) return next(err);
  const rota = `${req.method} ${req.originalUrl}`;

  if (err instanceof RequestValidationError) {
    if (!emTeste) logger.warn(`[400] ${rota} - dados inválidos`, JSON.stringify(err.detalhes));
    res.status(400).json(corpoErro("DADOS_INVALIDOS", err.message, err.detalhes));
    return;
  }

  if (err instanceof DomainError) {
    const status = STATUS_POR_CODIGO[err.code] ?? 422;
    if (!emTeste) logger.warn(`[${status}] ${rota} - ${err.code}: ${err.message}`);
    res.status(status).json(corpoErro(err.code, err.message));
    return;
  }

  // Erros do express.json(): JSON malformado ou corpo grande demais
  if (err?.type === "entity.parse.failed") {
    res.status(400).json(corpoErro("JSON_INVALIDO", "O corpo da requisição não é um JSON válido."));
    return;
  }
  if (err?.type === "entity.too.large") {
    res.status(413).json(corpoErro("PAYLOAD_MUITO_GRANDE", "O corpo da requisição excede o tamanho permitido."));
    return;
  }

  // Qualquer outro erro é interno: registra tudo no log, mas não vaza detalhes para o cliente.
  logger.error(`[500] ${rota}`, err);
  res.status(500).json(corpoErro("ERRO_INTERNO", "Erro interno do servidor."));
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(corpoErro("ROTA_NAO_ENCONTRADA", `Rota ${req.method} ${req.path} não encontrada.`));
}
