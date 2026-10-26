import { randomUUID } from 'crypto';
import { DomainError } from '../errors/DomainError';

export type StatusResponsavelTecnico = 'ativo' | 'inativo';

export interface ResponsavelTecnicoProps {
  id?: string;
  nome: string;
  telefone?: string;
  email?: string;
  cpf?: string;
  registroCrq?: string;
  status?: StatusResponsavelTecnico;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidade ResponsavelTecnico — profissional que responde tecnicamente pela carga.
 *
 * Regras aplicadas:
 * - não pode ser cadastrado sem nome;
 * - todo responsável nasce "ativo".
 */
export class ResponsavelTecnico {
  readonly id: string;
  readonly nome: string;
  readonly telefone?: string;
  readonly email?: string;
  readonly cpf?: string;
  readonly registroCrq?: string;
  readonly status: StatusResponsavelTecnico;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: Required<Pick<ResponsavelTecnicoProps, 'id' | 'nome' | 'status' | 'createdAt' | 'updatedAt'>> &
    ResponsavelTecnicoProps) {
    this.id = props.id;
    this.nome = props.nome.trim();
    this.telefone = props.telefone;
    this.email = props.email;
    this.cpf = props.cpf;
    this.registroCrq = props.registroCrq;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Cadastra um novo responsável técnico, validando as regras de negócio. */
  static criar(props: ResponsavelTecnicoProps): ResponsavelTecnico {
    if (!props.nome || !props.nome.trim()) {
      throw new DomainError('NOME_OBRIGATORIO', 'Responsável técnico deve possuir um nome.');
    }
    const agora = new Date();
    return new ResponsavelTecnico({
      ...props,
      id: props.id ?? randomUUID(),
      nome: props.nome,
      status: 'ativo',
      createdAt: agora,
      updatedAt: agora,
    });
  }

  /** Reconstrói uma instância a partir de dados já persistidos. */
  static reidratar(
    props: Required<Pick<ResponsavelTecnicoProps, 'id' | 'nome' | 'status' | 'createdAt' | 'updatedAt'>> &
      ResponsavelTecnicoProps
  ): ResponsavelTecnico {
    return new ResponsavelTecnico(props);
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      telefone: this.telefone,
      email: this.email,
      cpf: this.cpf,
      registroCrq: this.registroCrq,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
