import { z } from "zod";
import { UnidadeMedida } from "../../domain/enums/UnidadeMedida";
import { StatusCargaType, TRANSICOES_PERMITIDAS } from "../../domain/value-objects/StatusCarga";
import { CAMPOS_NAO_PERMITIDOS, enumCampo, textoObrigatorio, textoOpcional, uuid, valoresDe } from "./common.dto";

const STATUS_CARGA = Object.keys(TRANSICOES_PERMITIDAS) as [StatusCargaType, ...StatusCargaType[]];
const statusCarga = enumCampo("status", STATUS_CARGA);

export const registrarCargaSchema = z
  .object({
    codigoCarga: textoObrigatorio("codigoCarga", 50),
    produtosQuimicosIds: z
      .array(uuid("produtosQuimicosIds"))
      .min(1, "Deve ser informado ao menos um produto químico"),
    responsavelTecnicoId: uuid("responsavelTecnicoId"),
    quantidade: z
      .number({ required_error: "quantidade é obrigatória", invalid_type_error: "quantidade deve ser numérica" })
      .positive("quantidade deve ser maior que zero"),
    unidadeMedida: enumCampo("unidadeMedida", valoresDe(UnidadeMedida)),
    origem: textoObrigatorio("origem", 150),
    destino: textoObrigatorio("destino", 150),
    documentacaoObrigatoria: z
      .boolean({ invalid_type_error: "documentacaoObrigatoria deve ser true ou false" })
      .default(false),
    dataEntrada: z
      .string({ invalid_type_error: "dataEntrada deve ser um texto ISO 8601" })
      .datetime({ offset: true, message: "dataEntrada deve estar no formato ISO 8601" })
      .transform((valor) => new Date(valor))
      .optional(),
  })
  .strict(CAMPOS_NAO_PERMITIDOS);

export type RegistrarCargaDTO = z.infer<typeof registrarCargaSchema>;

export const atualizarStatusSchema = z.object({ status: statusCarga }).strict(CAMPOS_NAO_PERMITIDOS);
export type AtualizarStatusDTO = z.infer<typeof atualizarStatusSchema>;

export const bloquearCargaSchema = z.object({ motivo: textoOpcional("motivo", 500) }).strict(CAMPOS_NAO_PERMITIDOS);
export type BloquearCargaDTO = z.infer<typeof bloquearCargaSchema>;

export const listarCargasQuerySchema = z.object({
  status: statusCarga.optional(),
  produtoQuimicoId: uuid("produtoQuimicoId").optional(),
});
export type ListarCargasQueryDTO = z.infer<typeof listarCargasQuerySchema>;