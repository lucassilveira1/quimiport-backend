import { randomUUID } from 'crypto';
import { StatusProduto } from '../enums/StatusProduto';
import { DomainError } from '../errors/DomainError';

export interface ProdutoQuimicoProps {
  id?: string;
  classeRiscoId?: string;
  grupoCompatibilidadeId?: string;
  nome: string;
  descricao?: string;
  numeroONU: string;
  status?: StatusProduto;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidade ProdutoQuimico.
 *
 * Regras aplicadas:
 * - não pode ser cadastrado sem nome;
 * - não pode ser cadastrado sem classe de risco válida;
 * - não pode ser cadastrado com status inválido;
 * - uma vez inativo, não pode ser reutilizado em novas cargas.
 */
export class ProdutoQuimico {
  readonly id: string;
  private _classeRiscoId?: string;
  private _grupoCompatibilidadeId?: string;
  private _nome: string;
  private _descricao?: string;
  private _numeroONU: string;
  private _status: StatusProduto;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: string;
    classeRiscoId?: string;
    grupoCompatibilidadeId?: string;
    nome: string;
    descricao?: string;
    numeroONU: string;
    status: StatusProduto;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this._classeRiscoId = props.classeRiscoId;
    this._grupoCompatibilidadeId = props.grupoCompatibilidadeId;
    this._nome = props.nome.trim();
    this._descricao = props.descricao;
    this._numeroONU = props.numeroONU;
    this._status = props.status;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /** Cria um novo produto químico, validando todas as regras de negócio. */
  static criar(props: ProdutoQuimicoProps): ProdutoQuimico {
    ProdutoQuimico.validar(props);
    const agora = new Date();
    return new ProdutoQuimico({
      id: props.id ?? randomUUID(),
      classeRiscoId: props.classeRiscoId,
      grupoCompatibilidadeId: props.grupoCompatibilidadeId,
      nome: props.nome,
      descricao: props.descricao,
      numeroONU: props.numeroONU,
      status: props.status ?? StatusProduto.ATIVO,
      createdAt: props.createdAt ?? agora,
      updatedAt: props.updatedAt ?? agora,
    });
  }

  /** Reconstrói uma instância a partir de dados já persistidos. */
  static reidratar(
    props: Required<Omit<ProdutoQuimicoProps, 'descricao' | 'classeRiscoId' | 'grupoCompatibilidadeId'>> &
      Pick<ProdutoQuimicoProps, 'descricao' | 'classeRiscoId' | 'grupoCompatibilidadeId'>
  ): ProdutoQuimico {
    return new ProdutoQuimico(props);
  }

  private static validar(props: ProdutoQuimicoProps): void {
    if (!props.nome || !props.nome.trim()) {
      throw new DomainError('NOME_OBRIGATORIO', 'Produto químico deve possuir um nome.');
    }
    if (props.status && !Object.values(StatusProduto).includes(props.status)) {
      throw new DomainError('STATUS_INVALIDO', 'Status do produto químico é inválido.');
    }
  }

  /** Marca o produto como inativo, impedindo seu uso em novas cargas. */
  inativar(): void {
    if (this._status === StatusProduto.INATIVO) {
      throw new DomainError('PRODUTO_JA_INATIVO', 'Produto químico já está inativo.');
    }
    this._status = StatusProduto.INATIVO;
    this._updatedAt = new Date();
  }

  atualizarDados(
    dados: Partial<Pick<ProdutoQuimicoProps, 'nome' | 'descricao' | 'classeRiscoId' | 'grupoCompatibilidadeId'>>
  ): void {
    if (dados.nome !== undefined) {
      ProdutoQuimico.validar({
        nome: dados.nome,
        numeroONU: this._numeroONU,
      });
      this._nome = dados.nome.trim();
    }
    if (dados.descricao !== undefined) this._descricao = dados.descricao;
    if (dados.classeRiscoId !== undefined) this._classeRiscoId = dados.classeRiscoId;
    if (dados.grupoCompatibilidadeId !== undefined) this._grupoCompatibilidadeId = dados.grupoCompatibilidadeId;
    this._updatedAt = new Date();
  }

  get nome(): string { return this._nome; }
  get descricao(): string | undefined { return this._descricao; }
  get numeroONU(): string { return this._numeroONU; }
  get classeRiscoId(): string | undefined { return this._classeRiscoId; }
  get grupoCompatibilidadeId(): string | undefined { return this._grupoCompatibilidadeId; }
  get status(): StatusProduto { return this._status; }
  get updatedAt(): Date { return this._updatedAt; }

  /** true quando o produto pode ser associado a novas cargas. */
  estaAtivo(): boolean {
    return this._status === StatusProduto.ATIVO;
  }

  toJSON() {
    return {
      id: this.id,
      classeRiscoId: this._classeRiscoId,
      grupoCompatibilidadeId: this._grupoCompatibilidadeId,
      nome: this._nome,
      descricao: this._descricao,
      numeroONU: this._numeroONU,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}