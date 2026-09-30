// Peças reutilizáveis dos DTOs. Responsável: Vitor
import { z } from "zod";

/** Texto obrigatório, com trim e mensagens em português. */
export const textoObrigatorio = (campo: string, max: number) =>
  z
    .string({ required_error: `${campo} é obrigatório`, invalid_type_error: `${campo} deve ser um texto` })
    .trim()
    .min(1, `${campo} é obrigatório`)
    .max(max, `${campo} deve ter no máximo ${max} caracteres`);

export const textoOpcional = (campo: string, max: number) =>
  z
    .string({ invalid_type_error: `${campo} deve ser um texto` })
    .trim()
    .max(max, `${campo} deve ter no máximo ${max} caracteres`)
    .optional();

/** Enum com mensagem amigável que lista os valores aceitos. */
export const enumCampo = <U extends string, T extends Readonly<[U, ...U[]]>>(campo: string, valores: T) =>
  z.enum(valores, {
    errorMap: (_issue, ctx) => ({
      message:
        ctx.data === undefined
          ? `${campo} é obrigatório`
          : `${campo} inválido. Valores aceitos: ${valores.join(", ")}`,
    }),
  });

/** Transforma os valores de um enum TypeScript do domínio em tupla aceita pelo Zod. */
export const valoresDe = <E extends Record<string, string>>(enumeracao: E) =>
  Object.values(enumeracao) as [E[keyof E], ...E[keyof E][]];

/** IDs são UUID (gerados pelo domínio com randomUUID, banco PostgreSQL). */
export const uuid = (campo: string) =>
  z
    .string({ required_error: `${campo} é obrigatório`, invalid_type_error: `${campo} deve ser um texto` })
    .uuid(`${campo} deve ser um UUID válido`);

export const idParamsSchema = z.object({ id: uuid("id") });
export type IdParamsDTO = z.infer<typeof idParamsSchema>;

export const CAMPOS_NAO_PERMITIDOS = "O corpo da requisição contém campos não permitidos";
