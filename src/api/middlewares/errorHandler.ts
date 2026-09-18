// Middleware de tratamento de erros. Responsável: Vitor
import { NextFunction, Request, Response } from "express";
import { DomainError } from "../../domain/errors/DomainError";
import { logger } from "../../config/logger";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof DomainError) {
    res.status(422).json({ message: err.message });
    return;
  }

  logger.error(err);
  res.status(500).json({ message: "Erro interno do servidor." });
}
