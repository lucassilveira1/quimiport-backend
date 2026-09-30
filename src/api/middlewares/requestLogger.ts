// Middleware de log de requisições. Responsável: Vitor (com apoio do Lucas na estratégia de logs)
// Registra método, rota, status da resposta e tempo de processamento.
import { NextFunction, Request, Response } from "express";
import { logger } from "../../config/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === "test") return next();

  const inicio = Date.now();
  res.on("finish", () => {
    const linha = `${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - inicio}ms`;
    if (res.statusCode >= 500) logger.error(linha);
    else if (res.statusCode >= 400) logger.warn(linha);
    else logger.info(linha);
  });
  next();
}
