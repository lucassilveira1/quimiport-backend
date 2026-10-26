// Testes HTTP de cargas químicas. Responsável: Vitor
import request from "supertest";
import { ClasseRisco } from "../../src/domain/enums/ClasseRisco";
import {
  CLASSE_RISCO_ID,
  RESPONSAVEL,
  avancarStatus,
  cargaValida,
  criarAppDeTeste,
  criarProduto,
  produtoValido,
  registrarCarga,
} from "./helpers";

const ID_INEXISTENTE = "6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f";

describe("API - Cargas químicas", () => {
  describe("POST /cargas-quimicas", () => {
    it("registra carga química (201) com status registrada", async () => {
      const app = criarAppDeTeste();
      const produtoId = await criarProduto(app);
      const res = await request(app).post("/cargas-quimicas").send(cargaValida(produtoId));

      expect(res.status).toBe(201);
      expect(res.headers.location).toBe(`/cargas-quimicas/${res.body.dados.id}`);
      expect(res.body.dados).toMatchObject({ codigoCarga: "SSZ-2026-0001", status: "registrada", quantidade: 1200 });
    });

    it("bloqueia carga com produto químico inativo (422)", async () => {
      const app = criarAppDeTeste();
      const produtoId = await criarProduto(app);
      await request(app).patch(`/produtos-quimicos/${produtoId}/inativar`);

      const res = await request(app).post("/cargas-quimicas").send(cargaValida(produtoId));
      expect(res.status).toBe(422);
      expect(res.body.erro.codigo).toBe("PRODUTO_INATIVO");
    });

    it("retorna 404 quando o produto não existe", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/cargas-quimicas").send(cargaValida(ID_INEXISTENTE));
      expect(res.status).toBe(404);
      expect(res.body.erro.codigo).toBe("PRODUTO_NAO_ENCONTRADO");
    });

    it.each([0, -5])("bloqueia carga com quantidade %s (400)", async (quantidade) => {
      const app = criarAppDeTeste();
      const produtoId = await criarProduto(app);
      const res = await request(app).post("/cargas-quimicas").send({ ...cargaValida(produtoId), quantidade });

      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes).toContainEqual(
        expect.objectContaining({ campo: "quantidade", mensagem: "quantidade deve ser maior que zero" })
      );
    });

    it("registra carga com vários produtos e devolve o resumo de cada um (201)", async () => {
      const app = criarAppDeTeste();
      const acido = await criarProduto(app);
      const etanol = await criarProduto(app, {
        ...produtoValido,
        nome: "Etanol",
        numeroONU: "UN1170",
        classeRisco: CLASSE_RISCO_ID[ClasseRisco.CLASSE_3_LIQUIDOS_INFLAMAVEIS],
      });

      const res = await request(app).post("/cargas-quimicas").send(cargaValida(acido, etanol, acido));

      expect(res.status).toBe(201);
      expect(res.body.dados.produtos).toEqual([
        { id: acido, nome: "Ácido Sulfúrico", numeroONU: "UN1830", classeRisco: "classe_8_corrosivos" },
        { id: etanol, nome: "Etanol", numeroONU: "UN1170", classeRisco: "classe_3_liquidos_inflamaveis" },
      ]);
      expect(res.body.dados).not.toHaveProperty("produtoQuimicoId");

      const filtro = await request(app).get(`/cargas-quimicas?produtoQuimicoId=${etanol}`);
      expect(filtro.body.total).toBe(1);
    });

    it("bloqueia a carga inteira se um dos produtos estiver inativo (422)", async () => {
      const app = criarAppDeTeste();
      const ativo = await criarProduto(app);
      const inativo = await criarProduto(app, { ...produtoValido, nome: "Cloro" });
      await request(app).patch(`/produtos-quimicos/${inativo}/inativar`);

      const res = await request(app).post("/cargas-quimicas").send(cargaValida(ativo, inativo));
      expect(res.status).toBe(422);
      expect(res.body.erro.codigo).toBe("PRODUTO_INATIVO");
    });

    it("bloqueia carga sem produto químico associado (400)", async () => {
      const app = criarAppDeTeste();
      const { produtos: _p, ...semProduto } = cargaValida();
      const res = await request(app).post("/cargas-quimicas").send(semProduto);
      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes[0]).toMatchObject({ campo: "produtos", mensagem: "produtos é obrigatório" });

      const listaVazia = await request(app).post("/cargas-quimicas").send(cargaValida());
      expect(listaVazia.status).toBe(400);
      expect(listaVazia.body.erro.detalhes[0].mensagem).toBe("a carga deve ter ao menos um produto");
    });

    it("não aceita mais o campo antigo produtoQuimicoId (400)", async () => {
      const app = criarAppDeTeste();
      const produtoId = await criarProduto(app);
      const res = await request(app)
        .post("/cargas-quimicas")
        .send({ ...cargaValida(produtoId), produtoQuimicoId: produtoId });
      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes[0].campo).toBe("produtoQuimicoId");
    });

    it("recebe o responsável técnico pelo id e devolve { id, nome } (201)", async () => {
      const app = criarAppDeTeste();
      const produtoId = await criarProduto(app);
      const res = await request(app).post("/cargas-quimicas").send(cargaValida(produtoId));
      expect(res.body.dados.responsavelTecnico).toEqual(RESPONSAVEL);
    });

    it("bloqueia responsável técnico que não é id (400)", async () => {
      const app = criarAppDeTeste();
      const produtoId = await criarProduto(app);
      const res = await request(app)
        .post("/cargas-quimicas")
        .send({ ...cargaValida(produtoId), responsavelTecnico: "Eng. Maria Souza" });
      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes[0].campo).toBe("responsavelTecnico");
    });

    it("retorna 404 quando o responsável técnico não existe", async () => {
      const app = criarAppDeTeste();
      const produtoId = await criarProduto(app);
      const res = await request(app)
        .post("/cargas-quimicas")
        .send({ ...cargaValida(produtoId), responsavelTecnico: ID_INEXISTENTE });
      expect(res.status).toBe(404);
      expect(res.body.erro.codigo).toBe("RESPONSAVEL_TECNICO_NAO_ENCONTRADO");
    });

    it("não aceita status no registro: toda carga nasce registrada (400)", async () => {
      const app = criarAppDeTeste();
      const produtoId = await criarProduto(app);
      const res = await request(app).post("/cargas-quimicas").send({ ...cargaValida(produtoId), status: "liberada" });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /cargas-quimicas", () => {
    it("lista cargas e filtra por status", async () => {
      const app = criarAppDeTeste();
      const id = await registrarCarga(app);
      await registrarCarga(app, { codigoCarga: "SSZ-2026-0002" });
      await request(app).patch(`/cargas-quimicas/${id}/cancelar`);

      const todas = await request(app).get("/cargas-quimicas");
      expect(todas.body.total).toBe(2);

      const canceladas = await request(app).get("/cargas-quimicas?status=cancelada");
      expect(canceladas.body.dados).toHaveLength(1);
      expect(canceladas.body.dados[0].id).toBe(id);
    });

    it("rejeita filtro de status inexistente (400)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).get("/cargas-quimicas?status=perdida");
      expect(res.status).toBe(400);
    });
  });

  describe("GET /cargas-quimicas/:id", () => {
    it("busca carga por id (200) e retorna 404 se não existir", async () => {
      const app = criarAppDeTeste();
      const id = await registrarCarga(app);

      expect((await request(app).get(`/cargas-quimicas/${id}`)).status).toBe(200);
      const res = await request(app).get(`/cargas-quimicas/${ID_INEXISTENTE}`);
      expect(res.status).toBe(404);
      expect(res.body.erro.codigo).toBe("CARGA_NAO_ENCONTRADA");
    });
  });

  describe("PATCH /cargas-quimicas/:id/status", () => {
    it("percorre o fluxo principal completo até finalizada", async () => {
      const app = criarAppDeTeste();
      const id = await registrarCarga(app);

      await avancarStatus(app, id, "em_analise", "em_inspecao");
      expect((await request(app).patch(`/cargas-quimicas/${id}/liberar`)).status).toBe(200);
      await avancarStatus(app, id, "em_movimentacao", "finalizada");

      const res = await request(app).get(`/cargas-quimicas/${id}`);
      expect(res.body.dados.status).toBe("finalizada");
    });

    it.each([
      ["registrada", "finalizada", []],
      ["em_inspecao", "finalizada", ["em_analise", "em_inspecao"]],
      ["em_analise", "registrada", ["em_analise"]],
    ])("bloqueia transição proibida %s -> %s (422)", async (_de, para, caminho) => {
      const app = criarAppDeTeste();
      const id = await registrarCarga(app);
      await avancarStatus(app, id, ...(caminho as string[]));

      const res = await request(app).patch(`/cargas-quimicas/${id}/status`).send({ status: para });
      expect(res.status).toBe(422);
      expect(res.body.erro.codigo).toBe("TRANSICAO_INVALIDA");
    });

    it("rejeita status inexistente (400)", async () => {
      const app = criarAppDeTeste();
      const id = await registrarCarga(app);
      const res = await request(app).patch(`/cargas-quimicas/${id}/status`).send({ status: "voando" });
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH bloquear / liberar / cancelar", () => {
    it("bloqueia carga em inspeção (200)", async () => {
      const app = criarAppDeTeste();
      const id = await registrarCarga(app);
      await avancarStatus(app, id, "em_analise", "em_inspecao");

      const res = await request(app).patch(`/cargas-quimicas/${id}/bloquear`).send({ motivo: "Embalagem avariada" });
      expect(res.status).toBe(200);
      expect(res.body.dados).toMatchObject({ status: "bloqueada", motivoBloqueio: "Embalagem avariada" });
    });

    it("impede movimentar carga bloqueada (422)", async () => {
      const app = criarAppDeTeste();
      const id = await registrarCarga(app);
      await avancarStatus(app, id, "em_analise", "em_inspecao");
      await request(app).patch(`/cargas-quimicas/${id}/bloquear`).send({});

      const res = await request(app).patch(`/cargas-quimicas/${id}/status`).send({ status: "em_movimentacao" });
      expect(res.status).toBe(422);
      expect(res.body.erro.codigo).toBe("TRANSICAO_INVALIDA");
    });

    it("impede liberar carga sem documentação obrigatória (422)", async () => {
      const app = criarAppDeTeste();
      const id = await registrarCarga(app, { documentacaoObrigatoria: false });
      await avancarStatus(app, id, "em_analise", "em_inspecao");

      const res = await request(app).patch(`/cargas-quimicas/${id}/liberar`);
      expect(res.status).toBe(422);
      expect(res.body.erro.codigo).toBe("DOCUMENTACAO_INCOMPLETA");
    });

    it("cancela carga (200) e depois impede liberar a carga cancelada (422)", async () => {
      const app = criarAppDeTeste();
      const id = await registrarCarga(app);

      const cancelar = await request(app).patch(`/cargas-quimicas/${id}/cancelar`);
      expect(cancelar.status).toBe(200);
      expect(cancelar.body.dados.status).toBe("cancelada");

      const liberar = await request(app).patch(`/cargas-quimicas/${id}/liberar`);
      expect(liberar.status).toBe(422);
    });

    it("carga finalizada não aceita novas mudanças de status (422)", async () => {
      const app = criarAppDeTeste();
      const id = await registrarCarga(app);
      await avancarStatus(app, id, "em_analise", "em_inspecao");
      await request(app).patch(`/cargas-quimicas/${id}/liberar`);
      await avancarStatus(app, id, "em_movimentacao", "finalizada");

      const res = await request(app).patch(`/cargas-quimicas/${id}/cancelar`);
      expect(res.status).toBe(422);
    });
  });

  describe("Erros genéricos", () => {
    it("rota inexistente retorna 404 padronizado", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).get("/nao-existe");
      expect(res.status).toBe(404);
      expect(res.body.erro.codigo).toBe("ROTA_NAO_ENCONTRADA");
    });
  });
});
