import { randomUUID } from 'crypto';
import { StatusCargaType, podeTransicionar } from '../value-objects/StatusCarga';
import { UnidadeMedida } from '../enums/UnidadeMedida';
import { DomainError } from '../errors/DomainError';

export interface CargaQuimicaProps {
  id?: string;
  codigoCarga: string;
  responsavelTecnicoId: string;
  produtosQuimicosIds?: string[];
  quantidade: number;
  unidadeMedida: UnidadeMedida;
  origem?: string;
  destino?: string;
  /** true quando toda a documentação obrigatória já foi providenciada. */
  documentacaoObrigatoria: boolean;
  status?: StatusCargaType;
  motivoBloqueio?: string;
  dataEntrada?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidade CargaQuimica — o agregado principal do domínio.
 *
 * Regras aplicadas no registro:
 * - deve possuir pelo menos um produto químico associado (relação N:N);
 * - não pode ser registrada com produtos químicos inativos;
 * - quantidade deve ser maior que zero;
 * - deve possuir responsável técnico (ID) informado.
 *
 * Transições de status: ver src/domain/value-objects/StatusCarga.ts.
 */
export class CargaQuimica {
  readonly id: string;
  private _codigoCarga: string;
  readonly responsavelTecnicoId: string;
  readonly produtosQuimicosIds: string[];
  private _quantidade: number;
  private _unidadeMedida: UnidadeMedida;
  private _origem?: string;
  private _destino?: string;
  private _documentacaoObrigatoria: boolean;
  private _status: StatusCargaType;
  private _motivoBloqueio?: string;
  readonly dataEntrada: Date;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: string;
    codigoCarga: string;
    responsavelTecnicoId: string;
    produtosQuimicosIds: string[];
    quantidade: number;
    unidadeMedida: UnidadeMedida;
    origem?: string;
    destino?: string;
    documentacaoObrigatoria: boolean;
    status: StatusCargaType;
    motivoBloqueio?: string;
    dataEntrada: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this._codigoCarga = props.codigoCarga;
    this.responsavelTecnicoId = props.responsavelTecnicoId;
    this.produtosQuimicosIds = props.produtosQuimicosIds;
    this._quantidade = props.quantidade;
    this._unidadeMedida = props.unidadeMedida;
    this._origem = props.origem;
    this._destino = props.destino;
    this._documentacaoObrigatoria = props.documentacaoObrigatoria;
    this._status = props.status;
    this._motivoBloqueio = props.motivoBloqueio;
    this.dataEntrada = props.dataEntrada;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * Registra uma nova carga química.
   * @param produtosEstaoAtivos resultado da checagem, feita pelo caso de uso,
   *        de que todos os produtos associados existem e estão ativos.
   */
  static registrar(props: CargaQuimicaProps, produtosEstaoAtivos: boolean): CargaQuimica {
    CargaQuimica.validar(props, produtosEstaoAtivos);
    const agora = new Date();
    return new CargaQuimica({
      id: props.id ?? randomUUID(),
      codigoCarga: props.codigoCarga,
      responsavelTecnicoId: props.responsavelTecnicoId,
      produtosQuimicosIds: props.produtosQuimicosIds ?? [],
      quantidade: props.quantidade,
      unidadeMedida: props.unidadeMedida,
      origem: props.origem,
      destino: props.destino,
      documentacaoObrigatoria: props.documentacaoObrigatoria ?? false,
      status: props.status ?? 'registrada',
      motivoBloqueio: props.motivoBloqueio,
      dataEntrada: props.dataEntrada ?? agora,
      createdAt: props.createdAt ?? agora,
      updatedAt: props.updatedAt ?? agora,
    });
  }

  /** Reconstrói uma instância a partir de dados já persistidos. */
  static reidratar(props: {
    id: string;
    codigoCarga: string;
    responsavelTecnicoId: string;
    produtosQuimicosIds: string[];
    quantidade: number;
    unidadeMedida: UnidadeMedida;
    origem?: string;
    destino?: string;
    documentacaoObrigatoria: boolean;
    status: StatusCargaType;
    motivoBloqueio?: string;
    dataEntrada: Date;
    createdAt: Date;
    updatedAt: Date;
  }): CargaQuimica {
    return new CargaQuimica(props);
  }

  private static validar(props: CargaQuimicaProps, produtosEstaoAtivos: boolean): void {
    if (!props.produtosQuimicosIds || props.produtosQuimicosIds.length === 0) {
      throw new DomainError(
        'PRODUTO_OBRIGATORIO',
        'Carga química não pode ser registrada sem ao menos um produto químico associado.'
      );
    }
    if (!produtosEstaoAtivos) {
      throw new DomainError(
        'PRODUTO_INATIVO',
        'Carga química não pode ser registrada contendo produto químico inativo.'
      );
    }
    if (props.quantidade === undefined || props.quantidade === null || props.quantidade <= 0) {
      throw new DomainError('QUANTIDADE_INVALIDA', 'A quantidade da carga deve ser maior que zero.');
    }
    if (!props.responsavelTecnicoId || !props.responsavelTecnicoId.trim()) {
      throw new DomainError(
        'RESPONSAVEL_TECNICO_OBRIGATORIO',
        'Toda carga deve possuir um responsável técnico informado.'
      );
    }
  }

  /** Transição genérica de status, validada pela máquina de estados. */
  transicionarPara(novoStatus: StatusCargaType): void {
    if (!podeTransicionar(this._status, novoStatus)) {
      throw new DomainError(
        'TRANSICAO_INVALIDA',
        `Não é possível transicionar a carga de "${this._status}" para "${novoStatus}".`
      );
    }
    if (novoStatus === 'liberada' && !this._documentacaoObrigatoria) {
      throw new DomainError(
        'DOCUMENTACAO_INCOMPLETA',
        'Carga não pode ser liberada sem toda a documentação obrigatória.'
      );
    }
    this._status = novoStatus;
    this._updatedAt = new Date();
  }

  /** Libera a carga para movimentação. Exige documentação obrigatória completa. */
  liberar(): void {
    this.transicionarPara('liberada');
  }

  /** Bloqueia a carga, impedindo sua movimentação até que o motivo seja resolvido. */
  bloquear(motivo?: string): void {
    this.transicionarPara('bloqueada');
    this._motivoBloqueio = motivo;
  }

  /** Cancela a carga. Estado terminal — não permite novas transições. */
  cancelar(): void {
    this.transicionarPara('cancelada');
  }

  get codigoCarga(): string { return this._codigoCarga; }
  get quantidade(): number { return this._quantidade; }
  get unidadeMedida(): UnidadeMedida { return this._unidadeMedida; }
  get origem(): string | undefined { return this._origem; }
  get destino(): string | undefined { return this._destino; }
  get documentacaoObrigatoria(): boolean { return this._documentacaoObrigatoria; }
  get status(): StatusCargaType { return this._status; }
  get motivoBloqueio(): string | undefined { return this._motivoBloqueio; }
  get updatedAt(): Date { return this._updatedAt; }

  toJSON() {
    return {
      id: this.id,
      codigoCarga: this._codigoCarga,
      responsavelTecnicoId: this.responsavelTecnicoId,
      produtosQuimicosIds: this.produtosQuimicosIds,
      quantidade: this._quantidade,
      unidadeMedida: this._unidadeMedida,
      origem: this._origem,
      destino: this._destino,
      documentacaoObrigatoria: this._documentacaoObrigatoria,
      status: this._status,
      motivoBloqueio: this._motivoBloqueio,
      dataEntrada: this.dataEntrada,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}