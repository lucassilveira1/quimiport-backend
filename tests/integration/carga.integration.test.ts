// Testes de integração do registro de carga (vários produtos + responsável por id),
// com o Postgres de verdade.
// Rodar com: npm run test:integration (precisa do banco no ar: docker compose up -d db)
import request from "supertest";
import { eq, inArray } from "drizzle-orm";
import { createApp } from "../../src/api/app";
import { ProdutoRepositoryImpl } from "../../src/infra/repositories/ProdutoRepositoryImpl";
import { CargaRepositoryImpl } from "../../src/infra/repositories/CargaRepositoryImpl";
import { ClasseRiscoRepositoryImpl } from "../../src/infra/repositories/ClasseRiscoRepositoryImpl";
import { GrupoCompatibilidadeRepositoryImpl } from "../../src/infra/repositories/GrupoCompatibilidadeRepositoryImpl";
import { ResponsavelTecnicoRepositoryImpl } from "../../src/infra/repositories/ResponsavelTecnicoRepositoryImpl";
import { db } from "../../src/infra/database";
import {
  cargaQuimica,
  produtoCargaQuimica,
  produtoQuimico,
  responsavelTecnico,
} from "../../src/infra/database/schema";

const ID_INEXISTENTE = "6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f";

const app = createApp({
  produtoRepository: new ProdutoRepositoryImpl(),
  cargaRepository: new CargaRepositoryImpl(),
  classeRiscoRepository: new ClasseRiscoRepositoryImpl(),
  grupoCompatibilidadeRepository: new GrupoCompatibilidadeRepositoryImpl(),
  responsavelTecnicoRepository: new ResponsavelTecnicoRepositoryImpl(),
});

const produtosCriados: string[] = [];
const cargasCriadas: string[] = [];
let responsavelId = "";
let classeId = "";

async function criarProduto(nome: string): Promise<string> {
  const res = await request(app)
    .post("/produtos-quimicos")
    .send({ nome, numeroONU: "UN9999", classeRisco: classeId });
  produtosCriados.push(res.body.dados.id);
  return res.body.dados.id;
}

async function registrarCarga(produtos: string[], responsavelTecnico = responsavelId) {
  const res = await request(app).post("/cargas-quimicas").send({
    codigoCarga: `INT-${Date.now()}`,
    produtos,
    quantidade: 100,
    unidadeMedida: "kg",
    origem: "Terminal Alemoa",
    destino: "Cubatão",
    responsavelTecnico,
  });
  if (res.body.dados?.id) cargasCriadas.push(res.body.dados.id);
  return res;
}

// Pega os ids pelas próprias rotas de cadastro, como faria quem consome a API.
beforeAll(async () => {
  const classes = await request(app).get("/classes-risco");
  const classe = classes.body.dados?.find((c: { codigo: string }) => c.codigo === "classe_8_corrosivos");
  if (!classe) throw new Error("Classe de risco não encontrada: rode npm run db:migrate (seed 0002).");
  classeId = classe.id;

  const responsavel = await request(app)
    .post("/responsaveis-tecnicos")
    .send({ nome: "Responsável teste integração", cpf: "123.456.789-09" });
  responsavelId = responsavel.body.dados.id;
});

afterAll(async () => {
  if (cargasCriadas.length > 0) {
    await db.delete(produtoCargaQuimica).where(inArray(produtoCargaQuimica.cargaQuimicaId, cargasCriadas));
    await db.delete(cargaQuimica).where(inArray(cargaQuimica.id, cargasCriadas));
  }
  if (produtosCriados.length > 0) {
    await db.delete(produtoQuimico).where(inArray(produtoQuimico.id, produtosCriados));
  }
  if (responsavelId) {
    await db.delete(responsavelTecnico).where(eq(responsavelTecnico.id, responsavelId));
  }
  await db.$client.end();
});

describe("Integração - registro de carga", () => {
  it("grava um vínculo por produto e devolve os produtos e o responsável (201)", async () => {
    const acido = await criarProduto("Ácido teste integração");
    const soda = await criarProduto("Soda teste integração");

    const res = await registrarCarga([acido, soda]);

    expect(res.status).toBe(201);
    expect(res.body.dados.produtos.map((p: { id: string }) => p.id)).toEqual([acido, soda]);
    expect(res.body.dados.produtos[0].classeRisco).toBe("classe_8_corrosivos");
    expect(res.body.dados.responsavelTecnico).toEqual({
      id: responsavelId,
      nome: "Responsável teste integração",
    });

    const vinculos = await db
      .select()
      .from(produtoCargaQuimica)
      .where(eq(produtoCargaQuimica.cargaQuimicaId, res.body.dados.id));
    expect(vinculos).toHaveLength(2);
  });

  it("responsável técnico que não existe retorna 404 e não grava a carga", async () => {
    const produto = await criarProduto("Produto teste integração");
    const antes = await db.select({ id: cargaQuimica.id }).from(cargaQuimica);

    const res = await registrarCarga([produto], ID_INEXISTENTE);

    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe("RESPONSAVEL_TECNICO_NAO_ENCONTRADO");
    const depois = await db.select({ id: cargaQuimica.id }).from(cargaQuimica);
    expect(depois).toHaveLength(antes.length);
  });
});
