import { randomUUID } from 'crypto';

export interface DocumentoProps {
  id?: string;
  cargaQuimicaId: string;
  arquivo: string;
  titulo: string;
}

export class Documento {
  readonly id: string;
  readonly cargaQuimicaId: string;
  readonly arquivo: string;
  readonly titulo: string;

  constructor(props: DocumentoProps) {
    this.id = props.id ?? randomUUID();
    this.cargaQuimicaId = props.cargaQuimicaId;
    this.arquivo = props.arquivo;
    this.titulo = props.titulo;
  }
}