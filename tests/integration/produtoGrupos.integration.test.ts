// Testes de integração dos grupos de compatibilidade, com o Postgres de verdade.
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
  classeRisco,
  grupoCompatibilidade,
  produtoGrupoCompatibilidade,
  produtoQuimico,
} from "../../src/infra/database/schema";

const ID_INEXISTENTE = "6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f";

// Código único por execução, que com certeza não está cadastrado.
const GRUPO_INEXISTENTE = `TX${Date.now().toString(36).toUpperCase()}`;

const app = createApp({
  produtoRepository: new ProdutoRepositoryImpl(),
  cargaRepository: new CargaRepositoryImpl(),
  classeRiscoRepository: new ClasseRiscoRepositoryImpl(),
  grupoCompatibilidadeRepository: new GrupoCompatibilidadeRepositoryImpl(),
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
  await db.$client.end();
});

describe("Integração - grupos de compatibilidade", () => {
  it("GET /grupos-compatibilidade lista os grupos do seed (migration 0003)", async () => {
    const res = await request(app).get("/grupos-compatibilidade");

    expect(res.status).toBe(200);
    expect(res.body.dados).toEqual(
      expect.arrayContaining([
        { id: expect.any(String), codigo: "G1", descricao: "Ácidos" },
        { id: expect.any(String), codigo: "G2", descricao: "Bases (álcalis)" },
        { id: expect.any(String), codigo: "G3", descricao: "Oxidantes" },
        { id: expect.any(String), codigo: "G4", descricao: "Inflamáveis" },
      ])
    );
  });

  it("aceita grupos cadastrados pelo código e pelo id, e o mesmo grupo repetido grava uma vez só", async () => {
    const idG1 = await buscarGrupoId("G1");

    const res = await criarProduto([idG1, "G1", "G2"]);

    expect(res.status).toBe(201);
    expect(codigos(res.body.dados.gruposCompatibilidade)).toEqual(["G1", "G2"]);

    const vinculos = await db
      .select()
      .from(produtoGrupoCompatibilidade)
      .where(eq(produtoGrupoCompatibilidade.produtoId, res.body.dados.id));
    expect(vinculos).toHaveLength(2);
  });

  it("código que não está cadastrado retorna 404, não cria o grupo e não cria o produto", async () => {
    const produtosAntes = [...produtosCriados];

    const res = await criarProduto(["G1", GRUPO_INEXISTENTE]);

    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe("GRUPO_COMPATIBILIDADE_NAO_ENCONTRADO");
    expect(await buscarGrupoId(GRUPO_INEXISTENTE)).toBeUndefined();

    const produtos = await db
      .select({ id: produtoQuimico.id })
      .from(produtoQuimico)
      .where(eq(produtoQuimico.nome, produtoBase.nome));
    expect(produtos.map(({ id }) => id).sort()).toEqual(produtosAntes.sort());
  });

  it("id que não existe retorna 404", async () => {
    const res = await criarProduto([ID_INEXISTENTE]);

    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe("GRUPO_COMPATIBILIDADE_NAO_ENCONTRADO");
  });

  it("GET devolve os grupos gravados no banco", async () => {
    const criado = await criarProduto(["G3", "G4"]);
    const res = await request(app).get(`/produtos-quimicos/${criado.body.dados.id}`);

    expect(res.status).toBe(200);
    expect(codigos(res.body.dados.gruposCompatibilidade)).toEqual(["G3", "G4"]);
  });

  it("PUT substitui os grupos; [] remove todos; sem o campo mantém", async () => {
    const criado = await criarProduto(["G1", "G2"]);
    const id = criado.body.dados.id;
    const { numeroONU: _onu, ...editaveis } = produtoBase;

    const substitui = await request(app)
      .put(`/produtos-quimicos/${id}`)
      .send({ ...editaveis, gruposCompatibilidade: ["G2"] });
    expect(codigos(substitui.body.dados.gruposCompatibilidade)).toEqual(["G2"]);

    const mantem = await request(app).put(`/produtos-quimicos/${id}`).send(editaveis);
    expect(codigos(mantem.body.dados.gruposCompatibilidade)).toEqual(["G2"]);

    const remove = await request(app)
      .put(`/produtos-quimicos/${id}`)
      .send({ ...editaveis, gruposCompatibilidade: [] });
    expect(codigos(remove.body.dados.gruposCompatibilidade)).toEqual([]);
  });
});
