// Middleware de log de requisições. Responsável: Vitor (com apoio do Lucas na estratégia de logs)
import { NextFunction, Request, Response } from "express";
import { logger } from "../../config/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
}
