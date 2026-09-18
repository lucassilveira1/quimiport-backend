/**
 * Entidade de domínio: Produto Químico
 * Responsável: Paula
 */

export type StatusProduto = "ativo" | "inativo";

export interface ProdutoQuimicoProps {
  id?: string;
  nome: string;
  descricao?: string;
  numeroOnu?: string;
  classeRisco: string;
  grupoCompatibilidade?: string;
  status?: StatusProduto;
}

export class ProdutoQuimico {
  readonly id?: string;
  nome: string;
  descricao?: string;
  numeroOnu?: string;
  classeRisco: string;
  grupoCompatibilidade?: string;
  status: StatusProduto;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: ProdutoQuimicoProps) {
    if (!props.nome) {
      throw new Error("Produto químico precisa de um nome.");
    }
    if (!props.classeRisco) {
      throw new Error("Produto químico precisa de uma classe de risco.");
    }
    if (props.status && !["ativo", "inativo"].includes(props.status)) {
      throw new Error("Status inválido para produto químico.");
    }

    this.id = props.id;
    this.nome = props.nome;
    this.descricao = props.descricao;
    this.numeroOnu = props.numeroOnu;
    this.classeRisco = props.classeRisco;
    this.grupoCompatibilidade = props.grupoCompatibilidade;
    this.status = props.status ?? "ativo";
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  inativar(): void {
    this.status = "inativo";
    this.updatedAt = new Date();
  }

  estaAtivo(): boolean {
    return this.status === "ativo";
  }
}
