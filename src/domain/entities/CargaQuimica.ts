/**
 * Entidade de domínio: Carga Química
 * Responsável: Paula
 */

import { StatusCargaType } from "../value-objects/StatusCarga";

export interface CargaQuimicaProps {
  id?: string;
  codigo?: string;
  produtoQuimicoId: string;
  quantidade: number;
  unidadeMedida?: string;
  origem?: string;
  destino?: string;
  responsavelTecnico: string;
  documentacaoObrigatoria?: boolean;
  status?: StatusCargaType;
}

export class CargaQuimica {
  readonly id?: string;
  codigo?: string;
  produtoQuimicoId: string;
  quantidade: number;
  unidadeMedida?: string;
  origem?: string;
  destino?: string;
  responsavelTecnico: string;
  documentacaoObrigatoria: boolean;
  status: StatusCargaType;
  readonly dataEntrada: Date;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: CargaQuimicaProps) {
    if (!props.produtoQuimicoId) {
      throw new Error("Carga química precisa de um produto químico associado.");
    }
    if (!(props.quantidade > 0)) {
      throw new Error("A quantidade da carga deve ser maior que zero.");
    }
    if (!props.responsavelTecnico) {
      throw new Error("Carga química precisa de um responsável técnico.");
    }

    this.id = props.id;
    this.codigo = props.codigo;
    this.produtoQuimicoId = props.produtoQuimicoId;
    this.quantidade = props.quantidade;
    this.unidadeMedida = props.unidadeMedida;
    this.origem = props.origem;
    this.destino = props.destino;
    this.responsavelTecnico = props.responsavelTecnico;
    this.documentacaoObrigatoria = props.documentacaoObrigatoria ?? false;
    this.status = props.status ?? "registrada";
    this.dataEntrada = new Date();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
