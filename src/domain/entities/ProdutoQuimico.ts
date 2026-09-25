import { randomUUID } from 'crypto';
import { ClasseRisco } from '../enums/ClasseRisco';
import { StatusProduto } from '../enums/StatusProduto';
import { DomainError } from '../errors/DomainError';

export interface ProdutoQuimicoProps {
  id?: string;
  nome: string;
  descricao?: string;
  numeroONU: string;
  classeRisco: ClasseRisco;
  grupoCompatibilidade?: string;
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
 * - uma vez inativo, não pode ser reutilizado em novas cargas (checado no
 *   caso de uso RegistrarCarga, que consulta este produto antes de criar a carga).
 */
export class ProdutoQuimico {
  readonly id: string;
  private _nome: string;
  private _descricao?: string;
  private _numeroONU: string;
  private _classeRisco: ClasseRisco;
  private _grupoCompatibilidade?: string;
  private _status: StatusProduto;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: string;
    nome: string;
    descricao?: string;
    numeroONU: string;
    classeRisco: ClasseRisco;
    grupoCompatibilidade?: string;
    status: StatusProduto;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this._nome = props.nome.trim();
    this._descricao = props.descricao;
    this._numeroONU = props.numeroONU;
    this._classeRisco = props.classeRisco;
    this._grupoCompatibilidade = props.grupoCompatibilidade;
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
      nome: props.nome,
      descricao: props.descricao,
      numeroONU: props.numeroONU,
      classeRisco: props.classeRisco,
      grupoCompatibilidade: props.grupoCompatibilidade,
      status: props.status ?? StatusProduto.ATIVO,
      createdAt: props.createdAt ?? agora,
      updatedAt: props.updatedAt ?? agora,
    });
  }

  /** Reconstrói uma instância a partir de dados já persistidos (uso da infraestrutura). */
  static reidratar(props: Required<Omit<ProdutoQuimicoProps, 'descricao' | 'grupoCompatibilidade'>> &
    Pick<ProdutoQuimicoProps, 'descricao' | 'grupoCompatibilidade'>): ProdutoQuimico {
    return new ProdutoQuimico(props);
  }

  private static validar(props: ProdutoQuimicoProps): void {
    if (!props.nome || !props.nome.trim()) {
      throw new DomainError('NOME_OBRIGATORIO', 'Produto químico deve possuir um nome.');
    }
    if (!props.classeRisco || !Object.values(ClasseRisco).includes(props.classeRisco)) {
      throw new DomainError(
        'CLASSE_RISCO_INVALIDA',
        'Produto químico deve possuir uma classe de risco válida.'
      );
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

  atualizarDados(dados: Partial<Pick<ProdutoQuimicoProps, 'nome' | 'descricao' | 'classeRisco' | 'grupoCompatibilidade'>>): void {
    if (dados.nome !== undefined || dados.classeRisco !== undefined) {
      ProdutoQuimico.validar({
        nome: dados.nome ?? this._nome,
        classeRisco: dados.classeRisco ?? this._classeRisco,
        numeroONU: this._numeroONU,
      });
    }
    if (dados.nome !== undefined) this._nome = dados.nome.trim();
    if (dados.descricao !== undefined) this._descricao = dados.descricao;
    if (dados.classeRisco !== undefined) this._classeRisco = dados.classeRisco;
    if (dados.grupoCompatibilidade !== undefined) this._grupoCompatibilidade = dados.grupoCompatibilidade;
    this._updatedAt = new Date();
  }

  get nome(): string { return this._nome; }
  get descricao(): string | undefined { return this._descricao; }
  get numeroONU(): string { return this._numeroONU; }
  get classeRisco(): ClasseRisco { return this._classeRisco; }
  get grupoCompatibilidade(): string | undefined { return this._grupoCompatibilidade; }
  get status(): StatusProduto { return this._status; }
  get updatedAt(): Date { return this._updatedAt; }

  /** true quando o produto pode ser associado a novas cargas. */
  estaAtivo(): boolean {
    return this._status === StatusProduto.ATIVO;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this._nome,
      descricao: this._descricao,
      numeroONU: this._numeroONU,
      classeRisco: this._classeRisco,
      grupoCompatibilidade: this._grupoCompatibilidade,
      status: this._status,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
