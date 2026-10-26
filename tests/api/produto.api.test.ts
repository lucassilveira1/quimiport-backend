// Testes HTTP de produtos químicos. Responsável: Vitor
import request from "supertest";
import { ClasseRisco } from "../../src/domain/enums/ClasseRisco";
import { CLASSE_RISCO_ID, cargaValida, criarAppDeTeste, criarProduto, produtoValido } from "./helpers";

/** Só os códigos dos grupos devolvidos, para comparar mais fácil. */
const codigos = (grupos: { codigo: string }[]) => grupos.map((g) => g.codigo);

const ID_INEXISTENTE = "6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f";

describe("API - Produtos químicos", () => {
  describe("POST /produtos-quimicos", () => {
    it("cadastra produto químico (201), com status ativo por padrão", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/produtos-quimicos").send(produtoValido);

      expect(res.status).toBe(201);
      expect(res.headers.location).toBe(`/produtos-quimicos/${res.body.dados.id}`);
      expect(res.body.dados).toMatchObject({ nome: "Ácido Sulfúrico", status: "ativo" });
    });

    it("bloqueia cadastro sem nome (400)", async () => {
      const app = criarAppDeTeste();
      const { nome: _nome, ...semNome } = produtoValido;
      const res = await request(app).post("/produtos-quimicos").send(semNome);

      expect(res.status).toBe(400);
      expect(res.body.erro.codigo).toBe("DADOS_INVALIDOS");
      expect(res.body.erro.detalhes).toContainEqual({ local: "body", campo: "nome", mensagem: "nome é obrigatório" });
    });

    it("bloqueia nome só com espaços (400)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/produtos-quimicos").send({ ...produtoValido, nome: "   " });
      expect(res.status).toBe(400);
    });

    it("bloqueia cadastro sem classe de risco (400)", async () => {
      const app = criarAppDeTeste();
      const { classeRisco: _c, ...semClasse } = produtoValido;
      const res = await request(app).post("/produtos-quimicos").send(semClasse);

      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes).toContainEqual(
        expect.objectContaining({ campo: "classeRisco", mensagem: "classeRisco é obrigatório" })
      );
    });

    it("devolve a classe de risco como { id, codigo } (201)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/produtos-quimicos").send(produtoValido);
      expect(res.body.dados.classeRisco).toEqual({
        id: produtoValido.classeRisco,
        codigo: "classe_8_corrosivos",
      });
    });

    it("bloqueia classe de risco que não é id (400)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/produtos-quimicos").send({ ...produtoValido, classeRisco: "classe_8_corrosivos" });
      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes[0]).toMatchObject({ campo: "classeRisco", mensagem: "classeRisco deve ser um UUID válido" });
    });

    it("retorna 404 para classe de risco que não existe", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/produtos-quimicos").send({ ...produtoValido, classeRisco: ID_INEXISTENTE });
      expect(res.status).toBe(404);
      expect(res.body.erro.codigo).toBe("CLASSE_RISCO_NAO_ENCONTRADA");
    });

    it("bloqueia status inválido (400)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/produtos-quimicos").send({ ...produtoValido, status: "pendente" });
      expect(res.status).toBe(400);
    });

    it("rejeita campos desconhecidos (400)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/produtos-quimicos").send({ ...produtoValido, preco: 10 });
      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes[0].campo).toBe("preco");
    });

    it("retorna 400 para JSON malformado", async () => {
      const app = criarAppDeTeste();
      const res = await request(app)
        .post("/produtos-quimicos")
        .set("Content-Type", "application/json")
        .send('{"nome": ');
      expect(res.status).toBe(400);
      expect(res.body.erro.codigo).toBe("JSON_INVALIDO");
    });
  });

  describe("GET /produtos-quimicos", () => {
    it("lista produtos e filtra por status", async () => {
      const app = criarAppDeTeste();
      const id = await criarProduto(app);
      await criarProduto(app, {
        ...produtoValido,
        nome: "Etanol",
        classeRisco: CLASSE_RISCO_ID[ClasseRisco.CLASSE_3_LIQUIDOS_INFLAMAVEIS],
      });
      await request(app).patch(`/produtos-quimicos/${id}/inativar`);

      const todos = await request(app).get("/produtos-quimicos");
      expect(todos.status).toBe(200);
      expect(todos.body.total).toBe(2);

      const ativos = await request(app).get("/produtos-quimicos?status=ativo");
      expect(ativos.body.dados).toHaveLength(1);
      expect(ativos.body.dados[0].nome).toBe("Etanol");
    });
  });

  describe("GET /produtos-quimicos/:id", () => {
    it("busca produto por id (200)", async () => {
      const app = criarAppDeTeste();
      const id = await criarProduto(app);
      const res = await request(app).get(`/produtos-quimicos/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.dados.id).toBe(id);
    });

    it("retorna 404 para produto inexistente", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).get(`/produtos-quimicos/${ID_INEXISTENTE}`);
      expect(res.status).toBe(404);
      expect(res.body.erro.codigo).toBe("PRODUTO_NAO_ENCONTRADO");
    });

    it("retorna 400 para id em formato inválido", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).get("/produtos-quimicos/abc");
      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes[0]).toMatchObject({ local: "params", campo: "id" });
    });
  });

  describe("PUT /produtos-quimicos/:id", () => {
    it("atualiza produto (200)", async () => {
      const app = criarAppDeTeste();
      const id = await criarProduto(app);
      const { numeroONU: _onu, ...editaveis } = produtoValido;
      const res = await request(app).put(`/produtos-quimicos/${id}`).send({ ...editaveis, nome: "Ácido Sulfúrico 98%" });

      expect(res.status).toBe(200);
      expect(res.body.dados.nome).toBe("Ácido Sulfúrico 98%");
    });

    it("troca a classe de risco pelo id (200) e retorna 404 se ela não existir", async () => {
      const app = criarAppDeTeste();
      const id = await criarProduto(app);
      const { numeroONU: _onu, ...editaveis } = produtoValido;
      const idClasse9 = CLASSE_RISCO_ID[ClasseRisco.CLASSE_9_DIVERSOS];

      const res = await request(app).put(`/produtos-quimicos/${id}`).send({ ...editaveis, classeRisco: idClasse9 });
      expect(res.status).toBe(200);
      expect(res.body.dados.classeRisco).toEqual({ id: idClasse9, codigo: "classe_9_diversos" });

      const inexistente = await request(app)
        .put(`/produtos-quimicos/${id}`)
        .send({ ...editaveis, classeRisco: ID_INEXISTENTE });
      expect(inexistente.status).toBe(404);
      expect(inexistente.body.erro.codigo).toBe("CLASSE_RISCO_NAO_ENCONTRADA");
    });

    it("não permite alterar status pelo PUT (400)", async () => {
      const app = criarAppDeTeste();
      const id = await criarProduto(app);
      const { numeroONU: _onu, ...editaveis } = produtoValido;
      const res = await request(app).put(`/produtos-quimicos/${id}`).send({ ...editaveis, status: "inativo" });
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /produtos-quimicos/:id/inativar", () => {
    it("inativa produto (204) e depois ele aparece como inativo", async () => {
      const app = criarAppDeTeste();
      const id = await criarProduto(app);

      const res = await request(app).patch(`/produtos-quimicos/${id}/inativar`);
      expect(res.status).toBe(204);

      const busca = await request(app).get(`/produtos-quimicos/${id}`);
      expect(busca.body.dados.status).toBe("inativo");
    });

    it("retorna 409 ao inativar produto já inativo", async () => {
      const app = criarAppDeTeste();
      const id = await criarProduto(app);
      await request(app).patch(`/produtos-quimicos/${id}/inativar`);
      const res = await request(app).patch(`/produtos-quimicos/${id}/inativar`);
      expect(res.status).toBe(409);
      expect(res.body.erro.codigo).toBe("PRODUTO_JA_INATIVO");
    });
  });

  describe("PATCH /produtos-quimicos/:id/ativar", () => {
    it("reativa produto inativo (204) e ele volta a aceitar cargas", async () => {
      const app = criarAppDeTeste();
      const id = await criarProduto(app);
      await request(app).patch(`/produtos-quimicos/${id}/inativar`);

      const res = await request(app).patch(`/produtos-quimicos/${id}/ativar`);
      expect(res.status).toBe(204);

      const busca = await request(app).get(`/produtos-quimicos/${id}`);
      expect(busca.body.dados.status).toBe("ativo");

      const carga = await request(app).post("/cargas-quimicas").send(cargaValida(id));
      expect(carga.status).toBe(201);
    });

    it("retorna 409 ao ativar produto já ativo", async () => {
      const app = criarAppDeTeste();
      const id = await criarProduto(app);
      const res = await request(app).patch(`/produtos-quimicos/${id}/ativar`);
      expect(res.status).toBe(409);
      expect(res.body.erro.codigo).toBe("PRODUTO_JA_ATIVO");
    });

    it("retorna 404 para produto inexistente", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).patch(`/produtos-quimicos/${ID_INEXISTENTE}/ativar`);
      expect(res.status).toBe(404);
    });
  });

  describe("gruposCompatibilidade", () => {
    it("aceita uma lista de grupos e devolve sem repetidos (201)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app)
        .post("/produtos-quimicos")
        .send({ ...produtoValido, gruposCompatibilidade: ["G1", "G2", "G1"] });

      expect(res.status).toBe(201);
      expect(codigos(res.body.dados.gruposCompatibilidade)).toEqual(["G1", "G2"]);
    });

    it("devolve cada grupo como { id, codigo } e aceita o id de volta (201)", async () => {
      const app = criarAppDeTeste();
      const primeiro = await request(app)
        .post("/produtos-quimicos")
        .send({ ...produtoValido, gruposCompatibilidade: ["G1"] });
      const [grupo] = primeiro.body.dados.gruposCompatibilidade;
      expect(grupo).toEqual({ id: expect.any(String), codigo: "G1" });

      const segundo = await request(app)
        .post("/produtos-quimicos")
        .send({ ...produtoValido, gruposCompatibilidade: [grupo.id] });
      expect(segundo.body.dados.gruposCompatibilidade).toEqual([grupo]);
    });

    it("aceita um grupo só, como texto (201)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app)
        .post("/produtos-quimicos")
        .send({ ...produtoValido, gruposCompatibilidade: "G1" });

      expect(res.status).toBe(201);
      expect(codigos(res.body.dados.gruposCompatibilidade)).toEqual(["G1"]);
    });

    it("sem o campo, o produto fica sem grupos (201)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/produtos-quimicos").send(produtoValido);
      expect(codigos(res.body.dados.gruposCompatibilidade)).toEqual([]);
    });

    it("bloqueia item que não é texto (400)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app)
        .post("/produtos-quimicos")
        .send({ ...produtoValido, gruposCompatibilidade: [123] });

      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes).toContainEqual(
        expect.objectContaining({ campo: "gruposCompatibilidade.0" })
      );
    });

    it("bloqueia item vazio (400)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app)
        .post("/produtos-quimicos")
        .send({ ...produtoValido, gruposCompatibilidade: ["  "] });
      expect(res.status).toBe(400);
    });

    it("não aceita mais o campo antigo grupoCompatibilidade (400)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app)
        .post("/produtos-quimicos")
        .send({ ...produtoValido, grupoCompatibilidade: "G1" });
      expect(res.status).toBe(400);
    });

    it("PUT substitui a lista; [] remove todos; sem o campo mantém (200)", async () => {
      const app = criarAppDeTeste();
      const id = await criarProduto(app, { ...produtoValido, gruposCompatibilidade: ["G1", "G2"] });
      const { numeroONU: _onu, ...editaveis } = produtoValido;

      const substitui = await request(app)
        .put(`/produtos-quimicos/${id}`)
        .send({ ...editaveis, gruposCompatibilidade: ["G3"] });
      expect(codigos(substitui.body.dados.gruposCompatibilidade)).toEqual(["G3"]);

      const mantem = await request(app).put(`/produtos-quimicos/${id}`).send(editaveis);
      expect(codigos(mantem.body.dados.gruposCompatibilidade)).toEqual(["G3"]);

      const remove = await request(app)
        .put(`/produtos-quimicos/${id}`)
        .send({ ...editaveis, gruposCompatibilidade: [] });
      expect(codigos(remove.body.dados.gruposCompatibilidade)).toEqual([]);
    });
  });
});
