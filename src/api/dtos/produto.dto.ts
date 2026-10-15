import { z } from "zod";
import { StatusProduto } from "../../domain/enums/StatusProduto";
import { CAMPOS_NAO_PERMITIDOS, enumCampo, textoObrigatorio, textoOpcional, uuid, valoresDe } from "./common.dto";

const statusProduto = enumCampo("status", valoresDe(StatusProduto));

export const criarProdutoSchema = z
  .object({
    nome: textoObrigatorio("nome", 150),
    descricao: textoOpcional("descricao", 1000),
    numeroONU: textoObrigatorio("numeroONU", 20),
    classeRiscoId: uuid("classeRiscoId").optional(),
    grupoCompatibilidadeId: uuid("grupoCompatibilidadeId").optional(),
    status: statusProduto.optional(),
  })
  .strict(CAMPOS_NAO_PERMITIDOS);
export type CriarProdutoDTO = z.infer<typeof criarProdutoSchema>;

export const atualizarProdutoSchema = z
  .object({
    nome: textoOpcional("nome", 150),
    descricao: textoOpcional("descricao", 1000),
    classeRiscoId: uuid("classeRiscoId").optional(),
    grupoCompatibilidadeId: uuid("grupoCompatibilidadeId").optional(),
  })
  .strict(CAMPOS_NAO_PERMITIDOS);
export type AtualizarProdutoDTO = z.infer<typeof atualizarProdutoSchema>;

export const listarProdutosQuerySchema = z.object({
  status: statusProduto.optional(),
});
export type ListarProdutosQueryDTO = z.infer<typeof listarProdutosQuerySchema>;