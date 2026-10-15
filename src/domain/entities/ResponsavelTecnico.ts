import { randomUUID } from 'crypto';

export interface ResponsavelTecnicoProps {
  id?: string;
  nome: string;
  telefone?: string;
  email?: string;
  cpf?: string;
  status?: string;
  registroCRQ?: string;
}

export class ResponsavelTecnico {
  readonly id: string;
  readonly nome: string;
  readonly telefone?: string;
  readonly email?: string;
  readonly cpf?: string;
  readonly status: string;
  readonly registroCRQ?: string;

  constructor(props: ResponsavelTecnicoProps) {
    this.id = props.id ?? randomUUID();
    this.nome = props.nome;
    this.telefone = props.telefone;
    this.email = props.email;
    this.cpf = props.cpf;
    this.status = props.status ?? 'ATIVO';
    this.registroCRQ = props.registroCRQ;
  }
}