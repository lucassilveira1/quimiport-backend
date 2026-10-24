// DTOs (formato de entrada) de produtos químicos. Responsável: Vitor
// Os valores aceitos vêm dos enums do domínio (Paula), então nunca ficam desatualizados.
import { z } from "zod";
import { ClasseRisco } from "../../domain/enums/ClasseRisco";
import { StatusProduto } from "../../domain/enums/StatusProduto";
import { CAMPOS_NAO_PERMITIDOS, enumCampo, textoObrigatorio, textoOpcional, valoresDe } from "./common.dto";

const classeRisco = enumCampo("classeRisco", valoresDe(ClasseRisco));
const statusProduto = enumCampo("status", valoresDe(StatusProduto));

/**
 * Um produto pode ter vários grupos de compatibilidade. Cada item pode ser o
 * código do grupo (ex.: "G1") ou o id dele. Aceita também um texto só ("G1").
 */
const gruposCompatibilidade = z
  .preprocess(
    (valor) => (typeof valor === "string" ? [valor] : valor),
    z.array(textoObrigatorio("gruposCompatibilidade", 36), {
      invalid_type_error: "gruposCompatibilidade deve ser uma lista de grupos",
    }),
  )
  .optional();

export const criarProdutoSchema = z
  .object({
    nome: textoObrigatorio("nome", 150),
    descricao: textoOpcional("descricao", 1000),
    numeroONU: textoObrigatorio("numeroONU", 20),
    classeRisco,
    gruposCompatibilidade,
    status: statusProduto.optional(),
  })
  .strict(CAMPOS_NAO_PERMITIDOS);
export type CriarProdutoDTO = z.infer<typeof criarProdutoSchema>;

/**
 * PUT: envia de novo os dados editáveis do produto.
 * numeroONU e status não mudam aqui (status muda por PATCH /:id/inativar).
 */
export const atualizarProdutoSchema = z
  .object({
    nome: textoObrigatorio("nome", 150),
    descricao: textoOpcional("descricao", 1000),
    classeRisco,
    gruposCompatibilidade,
  })
  .strict(CAMPOS_NAO_PERMITIDOS);
export type AtualizarProdutoDTO = z.infer<typeof atualizarProdutoSchema>;

export const listarProdutosQuerySchema = z.object({
  status: statusProduto.optional(),
});
export type ListarProdutosQueryDTO = z.infer<typeof listarProdutosQuerySchema>;
