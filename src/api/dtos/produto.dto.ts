// DTOs (formato de entrada) de produtos químicos. Responsável: Vitor
// Os valores aceitos vêm dos enums do domínio (Paula), então nunca ficam desatualizados.
import { z } from "zod";
import { ClasseRisco } from "../../domain/enums/ClasseRisco";
import { StatusProduto } from "../../domain/enums/StatusProduto";
import { CAMPOS_NAO_PERMITIDOS, enumCampo, textoObrigatorio, textoOpcional, valoresDe } from "./common.dto";

const classeRisco = enumCampo("classeRisco", valoresDe(ClasseRisco));
const statusProduto = enumCampo("status", valoresDe(StatusProduto));

export const criarProdutoSchema = z
  .object({
    nome: textoObrigatorio("nome", 150),
    descricao: textoOpcional("descricao", 1000),
    numeroONU: textoObrigatorio("numeroONU", 20),
    classeRisco,
    grupoCompatibilidade: textoOpcional("grupoCompatibilidade", 10),
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
    grupoCompatibilidade: textoOpcional("grupoCompatibilidade", 10),
  })
  .strict(CAMPOS_NAO_PERMITIDOS);
export type AtualizarProdutoDTO = z.infer<typeof atualizarProdutoSchema>;

export const listarProdutosQuerySchema = z.object({
  status: statusProduto.optional(),
});
export type ListarProdutosQueryDTO = z.infer<typeof listarProdutosQuerySchema>;
