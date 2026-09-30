// Middleware de validação de payload com Zod. Responsável: Vitor
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodTypeAny } from "zod";
import { ErroDeCampo, RequestValidationError } from "../errors/RequestValidationError";

type Local = "params" | "query" | "body";
type Schemas = Partial<Record<Local, ZodTypeAny>>;

/**
 * Valida params/query/body. Se houver erro, junta TODOS os problemas e gera
 * um RequestValidationError (→ 400). Se estiver tudo certo, guarda os dados
 * já tratados (trim, defaults, datas convertidas) em res.locals.validated.
 */
export const validate =
  (schemas: Schemas): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const erros: ErroDeCampo[] = [];
    const validated: Partial<Record<Local, unknown>> = {};

    for (const local of ["params", "query", "body"] as const) {
      const schema = schemas[local];
      if (!schema) continue;

      const entrada = local === "body" ? req.body ?? {} : req[local];
      const resultado = schema.safeParse(entrada);

      if (resultado.success) {
        validated[local] = resultado.data;
        continue;
      }
      for (const issue of resultado.error.issues) {
        const camposExtras = issue.code === "unrecognized_keys" ? issue.keys.join(", ") : null;
        erros.push({ local, campo: issue.path.length ? issue.path.join(".") : camposExtras, mensagem: issue.message });
      }
    }

    if (erros.length) return next(new RequestValidationError(erros));

    res.locals.validated = validated;
    next();
  };

/** Lê os dados já validados pelo middleware `validate`. */
export function validated<T>(res: Response, local: Local): T {
  return res.locals.validated?.[local] as T;
}
