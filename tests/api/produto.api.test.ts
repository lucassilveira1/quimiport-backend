// Testes HTTP de produtos químicos. Responsável: Vitor
import request from "supertest";
import { criarAppDeTeste, criarProduto, produtoValido } from "./helpers";

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

    it("bloqueia classe de risco inexistente (400) e lista os valores aceitos", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/produtos-quimicos").send({ ...produtoValido, classeRisco: "classe_10" });
      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes[0].mensagem).toContain("classe_8_corrosivos");
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
      await criarProduto(app, { ...produtoValido, nome: "Etanol", classeRisco: "classe_3_liquidos_inflamaveis" });
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
});
