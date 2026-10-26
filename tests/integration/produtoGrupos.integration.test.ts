// Testes de integração dos grupos de compatibilidade, com o Postgres de verdade.
// Rodar com: npm run test:integration (precisa do banco no ar: docker compose up -d db)
import request from "supertest";
import { eq, inArray } from "drizzle-orm";
import { createApp } from "../../src/api/app";
import { ProdutoRepositoryImpl } from "../../src/infra/repositories/ProdutoRepositoryImpl";
import { CargaRepositoryImpl } from "../../src/infra/repositories/CargaRepositoryImpl";
import { ClasseRiscoRepositoryImpl } from "../../src/infra/repositories/ClasseRiscoRepositoryImpl";
import { ResponsavelTecnicoRepositoryImpl } from "../../src/infra/repositories/ResponsavelTecnicoRepositoryImpl";
import { db } from "../../src/infra/database";
import {
  classeRisco,
  grupoCompatibilidade,
  produtoGrupoCompatibilidade,
  produtoQuimico,
} from "../../src/infra/database/schema";

const ID_INEXISTENTE = "6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f";

// Códigos únicos por execução, para não misturar com dados que já estão no banco.
const sufixo = Date.now().toString(36).toUpperCase();
const GRUPO_A = `TA${sufixo}`;
const GRUPO_B = `TB${sufixo}`;

const app = createApp({
  produtoRepository: new ProdutoRepositoryImpl(),
  cargaRepository: new CargaRepositoryImpl(),
  classeRiscoRepository: new ClasseRiscoRepositoryImpl(),
  responsavelTecnicoRepository: new ResponsavelTecnicoRepositoryImpl(),
});

const produtosCriados: string[] = [];

const produtoBase = {
  nome: "Produto teste integração",
  numeroONU: "UN9999",
  classeRisco: "", // id preenchido no beforeAll (classe vem do seed da migration 0002)
};

async function criarProduto(gruposCompatibilidade?: unknown) {
  const res = await request(app)
    .post("/produtos-quimicos")
    .send({ ...produtoBase, gruposCompatibilidade });
  if (res.body.dados?.id) produtosCriados.push(res.body.dados.id);
  return res;
}

async function buscarGrupoId(grupo: string): Promise<string | undefined> {
  const [linha] = await db
    .select({ id: grupoCompatibilidade.id })
    .from(grupoCompatibilidade)
    .where(eq(grupoCompatibilidade.grupo, grupo));
  return linha?.id;
}

/** Só os códigos dos grupos devolvidos, para comparar mais fácil. */
const codigos = (grupos: { codigo: string }[]) => grupos.map((g) => g.codigo);

beforeAll(async () => {
  const [classe] = await db
    .select({ id: classeRisco.id })
    .from(classeRisco)
    .where(eq(classeRisco.classe, "classe_8_corrosivos"));
  if (!classe) throw new Error("Classe de risco não encontrada: rode npm run db:migrate (seed 0002).");
  produtoBase.classeRisco = classe.id;
});

afterAll(async () => {
  if (produtosCriados.length > 0) {
    await db
      .delete(produtoGrupoCompatibilidade)
      .where(inArray(produtoGrupoCompatibilidade.produtoId, produtosCriados));
    await db.delete(produtoQuimico).where(inArray(produtoQuimico.id, produtosCriados));
  }
  await db
    .delete(grupoCompatibilidade)
    .where(inArray(grupoCompatibilidade.grupo, [GRUPO_A, GRUPO_B]));
  await db.$client.end();
});

describe("Integração - grupos de compatibilidade do produto", () => {
  it("código que não existe cria o grupo na hora (201)", async () => {
    expect(await buscarGrupoId(GRUPO_A)).toBeUndefined();

    const res = await criarProduto([GRUPO_A]);

    expect(res.status).toBe(201);
    expect(codigos(res.body.dados.gruposCompatibilidade)).toEqual([GRUPO_A]);
    expect(await buscarGrupoId(GRUPO_A)).toBeDefined();
  });

  it("código que já existe reaproveita o grupo, sem duplicar", async () => {
    await criarProduto([GRUPO_A]);

    const linhas = await db
      .select()
      .from(grupoCompatibilidade)
      .where(eq(grupoCompatibilidade.grupo, GRUPO_A));
    expect(linhas).toHaveLength(1);
  });

  it("aceita id e código misturados, e o mesmo grupo repetido grava uma vez só", async () => {
    const idGrupoA = await buscarGrupoId(GRUPO_A);

    const res = await criarProduto([idGrupoA, GRUPO_A, GRUPO_B]);

    expect(res.status).toBe(201);
    expect(codigos(res.body.dados.gruposCompatibilidade)).toEqual([GRUPO_A, GRUPO_B]);

    const vinculos = await db
      .select()
      .from(produtoGrupoCompatibilidade)
      .where(eq(produtoGrupoCompatibilidade.produtoId, res.body.dados.id));
    expect(vinculos).toHaveLength(2);
  });

  it("id que não existe retorna 404 e não cria o produto", async () => {
    const res = await criarProduto([ID_INEXISTENTE]);

    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe("GRUPO_COMPATIBILIDADE_NAO_ENCONTRADO");

    const produtos = await db
      .select({ id: produtoQuimico.id })
      .from(produtoQuimico)
      .where(eq(produtoQuimico.nome, produtoBase.nome));
    expect(produtos.map(({ id }) => id).sort()).toEqual([...produtosCriados].sort());
  });

  it("GET devolve os grupos gravados no banco", async () => {
    const criado = await criarProduto([GRUPO_A, GRUPO_B]);
    const res = await request(app).get(`/produtos-quimicos/${criado.body.dados.id}`);

    expect(res.status).toBe(200);
    expect(codigos(res.body.dados.gruposCompatibilidade)).toEqual([GRUPO_A, GRUPO_B]);
  });

  it("PUT substitui os grupos; [] remove todos; sem o campo mantém", async () => {
    const criado = await criarProduto([GRUPO_A, GRUPO_B]);
    const id = criado.body.dados.id;
    const { numeroONU: _onu, ...editaveis } = produtoBase;

    const substitui = await request(app)
      .put(`/produtos-quimicos/${id}`)
      .send({ ...editaveis, gruposCompatibilidade: [GRUPO_B] });
    expect(codigos(substitui.body.dados.gruposCompatibilidade)).toEqual([GRUPO_B]);

    const mantem = await request(app).put(`/produtos-quimicos/${id}`).send(editaveis);
    expect(codigos(mantem.body.dados.gruposCompatibilidade)).toEqual([GRUPO_B]);

    const remove = await request(app)
      .put(`/produtos-quimicos/${id}`)
      .send({ ...editaveis, gruposCompatibilidade: [] });
    expect(codigos(remove.body.dados.gruposCompatibilidade)).toEqual([]);
  });
});
