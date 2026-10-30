// Helpers dos testes da camada HTTP. Responsável: Vitor
// Sobe a aplicação real (rotas + controllers + casos de uso + domínio),
// trocando só o banco por repositórios em memória.
import request from "supertest";
import { createApp } from "../../src/api/app";
import { ProdutoRepository } from "../../src/application/repositories/ProdutoRepository";
import { CargaRepository } from "../../src/application/repositories/CargaRepository";
import { ClasseRiscoRepository } from "../../src/application/repositories/ClasseRiscoRepository";
import { GrupoCompatibilidadeRepository } from "../../src/application/repositories/GrupoCompatibilidadeRepository";
import { ResponsavelTecnicoRepository } from "../../src/application/repositories/ResponsavelTecnicoRepository";
import { ProdutoQuimico } from "../../src/domain/entities/ProdutoQuimico";
import { ResponsavelTecnico } from "../../src/domain/entities/ResponsavelTecnico";
import { CargaQuimica, ResponsavelDaCarga } from "../../src/domain/entities/CargaQuimica";
import { ClasseRisco } from "../../src/domain/enums/ClasseRisco";
import { Referencia } from "../../src/domain/value-objects/Referencia";

/** Ids fixos das classes de risco "cadastradas" (no banco, vêm do seed da migration 0002). */
export const CLASSE_RISCO_ID: Record<ClasseRisco, string> = Object.fromEntries(
  Object.values(ClasseRisco).map((classe, i) => [
    classe,
    `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  ])
) as Record<ClasseRisco, string>;

/** Responsável técnico "cadastrado" nos repositórios em memória. */
export const RESPONSAVEL: ResponsavelDaCarga = {
  id: "0c8c2542-92bd-4ebb-9d40-03294e94055b",
  nome: "Eng. Maria Souza",
};

/** Grupos de compatibilidade "cadastrados" (no banco, vêm do seed da migration 0003). */
export const GRUPOS: Referencia[] = [
  { id: "00000000-0000-4000-9000-000000000001", codigo: "G1", descricao: "Ácidos" },
  { id: "00000000-0000-4000-9000-000000000002", codigo: "G2", descricao: "Bases (álcalis)" },
  { id: "00000000-0000-4000-9000-000000000003", codigo: "G3", descricao: "Oxidantes" },
  { id: "00000000-0000-4000-9000-000000000004", codigo: "G4", descricao: "Inflamáveis" },
];

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
  async ativar() {
    // a entidade já foi reativada pelo caso de uso
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

/** As 9 classes da ONU, com os ids fixos de CLASSE_RISCO_ID. */
export class ClasseRiscoRepositoryEmMemoria implements ClasseRiscoRepository {
  private classes: Referencia[] = Object.values(ClasseRisco).map((codigo) => ({
    id: CLASSE_RISCO_ID[codigo],
    codigo,
  }));
  async listar() {
    return this.classes;
  }
  async buscarPorId(id: string) {
    return this.classes.find((c) => c.id === id) ?? null;
  }
}

/** Os 4 grupos de GRUPOS, buscados pelo id ou pelo código. */
export class GrupoCompatibilidadeRepositoryEmMemoria implements GrupoCompatibilidadeRepository {
  async listar() {
    return GRUPOS;
  }
  async buscarPorReferencia(referencia: string) {
    return GRUPOS.find((g) => g.id === referencia || g.codigo === referencia) ?? null;
  }
}

/** Já começa com o RESPONSAVEL cadastrado, para os testes de carga. */
export class ResponsavelTecnicoRepositoryEmMemoria implements ResponsavelTecnicoRepository {
  private responsaveis = new Map<string, ResponsavelTecnico>([
    [RESPONSAVEL.id, ResponsavelTecnico.criar({ id: RESPONSAVEL.id, nome: RESPONSAVEL.nome })],
  ]);
  async criar(responsavel: ResponsavelTecnico) {
    this.responsaveis.set(responsavel.id, responsavel);
    return responsavel;
  }
  async buscarPorId(id: string) {
    return this.responsaveis.get(id) ?? null;
  }
  async listar() {
    return [...this.responsaveis.values()];
  }
}

export function criarAppDeTeste() {
  return createApp({
    produtoRepository: new ProdutoRepositoryEmMemoria(),
    cargaRepository: new CargaRepositoryEmMemoria(),
    classeRiscoRepository: new ClasseRiscoRepositoryEmMemoria(),
    grupoCompatibilidadeRepository: new GrupoCompatibilidadeRepositoryEmMemoria(),
    responsavelTecnicoRepository: new ResponsavelTecnicoRepositoryEmMemoria(),
  });
}

export const produtoValido = {
  nome: "Ácido Sulfúrico",
  descricao: "Ácido forte corrosivo",
  numeroONU: "UN1830",
  classeRisco: CLASSE_RISCO_ID[ClasseRisco.CLASSE_8_CORROSIVOS],
};

export const cargaValida = (...produtos: string[]) => ({
  codigoCarga: "SSZ-2026-0001",
  produtos,
  quantidade: 1200,
  unidadeMedida: "kg",
  origem: "Terminal Alemoa",
  destino: "Cubatão",
  responsavelTecnico: RESPONSAVEL.id,
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
