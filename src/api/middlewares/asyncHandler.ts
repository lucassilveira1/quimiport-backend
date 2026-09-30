// Responsável: Vitor
// No Express 4, erros lançados dentro de funções async NÃO chegam sozinhos ao
// errorHandler. Este wrapper captura a Promise rejeitada e repassa com next(err).
import { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
