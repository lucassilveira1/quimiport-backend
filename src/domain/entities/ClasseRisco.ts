import { randomUUID } from 'crypto';

export interface ClasseRiscoProps {
  id?: string;
  classe: string;
  descricao?: string;
}

export class ClasseRisco {
  readonly id: string;
  readonly classe: string;
  readonly descricao?: string;

  constructor(props: ClasseRiscoProps) {
    this.id = props.id ?? randomUUID();
    this.classe = props.classe;
    this.descricao = props.descricao;
  }
}