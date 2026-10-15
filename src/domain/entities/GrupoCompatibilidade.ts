import { randomUUID } from 'crypto';

export interface GrupoCompatibilidadeProps {
  id?: string;
  produtoQuimicoId?: string;
  grupo: string;
  descricao?: string;
}

export class GrupoCompatibilidade {
  readonly id: string;
  readonly produtoQuimicoId?: string;
  readonly grupo: string;
  readonly descricao?: string;

  constructor(props: GrupoCompatibilidadeProps) {
    this.id = props.id ?? randomUUID();
    this.produtoQuimicoId = props.produtoQuimicoId;
    this.grupo = props.grupo;
    this.descricao = props.descricao;
  }
}