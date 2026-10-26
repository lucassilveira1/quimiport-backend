// DTOs (formato de entrada) de responsáveis técnicos.
import { z } from "zod";
import { CAMPOS_NAO_PERMITIDOS, textoObrigatorio, textoOpcional } from "./common.dto";

export const criarResponsavelTecnicoSchema = z
  .object({
    nome: textoObrigatorio("nome", 150),
    telefone: textoOpcional("telefone", 20),
    email: z
      .string({ invalid_type_error: "email deve ser um texto" })
      .trim()
      .email("email deve ser um e-mail válido")
      .max(150, "email deve ter no máximo 150 caracteres")
      .optional(),
    // Com ou sem pontuação: 123.456.789-09 ou 12345678909 (a coluna no banco tem 14 caracteres).
    cpf: z
      .string({ invalid_type_error: "cpf deve ser um texto" })
      .trim()
      .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "cpf deve estar no formato 123.456.789-09")
      .optional(),
    registroCrq: textoOpcional("registroCrq", 30),
  })
  .strict(CAMPOS_NAO_PERMITIDOS); // status não é aceito: todo responsável nasce "ativo"
export type CriarResponsavelTecnicoDTO = z.infer<typeof criarResponsavelTecnicoSchema>;
