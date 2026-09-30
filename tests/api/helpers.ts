// Helpers dos testes da camada HTTP. Responsável: Vitor
// Sobe a aplicação real (rotas + controllers + casos de uso + domínio),
// trocando só o banco por repositórios em memória.
import request from "supertest";
import { createApp } from "../../src/api/app";
import { ProdutoRepository } from "../../src/application/repositories/ProdutoRepository";
import { CargaRepository } from "../../src/application/repositories/CargaRepository";
import { ProdutoQuimico } from "../../src/domain/entities/ProdutoQuimico";
import { CargaQuimica } from "../../src/domain/entities/CargaQuimica";

export class ProdutoRepositoryEmMemoria implements ProdutoRepository {
  private produtos = new Map<string, ProdutoQuimico>();
  async criar(produto: ProdutoQuimico) {
    this.produtos.set(produto.id, produto);
    return produto;
  }
  async buscarPorId(id: string) {
    return this.produtos.get(id) ?? null;
  }
  async listar() {
    return [...this.produtos.values()];
  }
  async atualizar(id: string) {
    return this.produtos.get(id)!; // a entidade já foi alterada pelo caso de uso
  }
  async inativar() {
    // a entidade já foi inativada pelo caso de uso
  }
}

export class CargaRepositoryEmMemoria implements CargaRepository {
  private cargas = new Map<string, CargaQuimica>();
  async criar(carga: CargaQuimica) {
    this.cargas.set(carga.id, carga);
    return carga;
  }
  async buscarPorId(id: string) {
    return this.cargas.get(id) ?? null;
  }
  async listar() {
    return [...this.cargas.values()];
  }
  async atualizarStatus(id: string) {
    return this.cargas.get(id)!; // a entidade já teve o status alterado pelo caso de uso
  }
}

export function criarAppDeTeste() {
  return createApp({
    produtoRepository: new ProdutoRepositoryEmMemoria(),
    cargaRepository: new CargaRepositoryEmMemoria(),
  });
}

export const produtoValido = {
  nome: "Ácido Sulfúrico",
  descricao: "Ácido forte corrosivo",
  numeroONU: "UN1830",
  classeRisco: "classe_8_corrosivos",
};

export const cargaValida = (produtoQuimicoId: string) => ({
  codigoCarga: "SSZ-2026-0001",
  produtoQuimicoId,
  quantidade: 1200,
  unidadeMedida: "kg",
  origem: "Terminal Alemoa",
  destino: "Cubatão",
  responsavelTecnico: "Eng. Maria Souza",
  documentacaoObrigatoria: true,
});

type App = ReturnType<typeof criarAppDeTeste>;

export async function criarProduto(app: App, dados: object = produtoValido): Promise<string> {
  const res = await request(app).post("/produtos-quimicos").send(dados);
  return res.body.dados.id;
}

export async function registrarCarga(app: App, extra: object = {}): Promise<string> {
  const produtoId = await criarProduto(app);
  const res = await request(app).post("/cargas-quimicas").send({ ...cargaValida(produtoId), ...extra });
  return res.body.dados.id;
}

/** Leva a carga pelo fluxo principal até o status desejado. */
export async function avancarStatus(app: App, cargaId: string, ...status: string[]) {
  for (const s of status) {
    const res = await request(app).patch(`/cargas-quimicas/${cargaId}/status`).send({ status: s });
    if (res.status !== 200) throw new Error(`Falha ao ir para ${s}: ${JSON.stringify(res.body)}`);
  }
}
