// Testes HTTP dos cadastros de apoio: classes de risco e responsáveis técnicos.
import request from "supertest";
import { CLASSE_RISCO_ID, GRUPOS, RESPONSAVEL, cargaValida, criarAppDeTeste, criarProduto, produtoValido } from "./helpers";

const ID_INEXISTENTE = "6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f";

const responsavelValido = {
  nome: "Eng. Carlos Lima",
  telefone: "(13) 99999-0000",
  email: "carlos.lima@quimiport.com.br",
  cpf: "123.456.789-09",
  registroCrq: "CRQ-IV 04123456",
};

describe("API - Classes de risco", () => {
  it("GET /classes-risco lista as classes com { id, codigo } (200)", async () => {
    const app = criarAppDeTeste();
    const res = await request(app).get("/classes-risco");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(9);
    expect(res.body.dados).toContainEqual({
      id: CLASSE_RISCO_ID.classe_8_corrosivos,
      codigo: "classe_8_corrosivos",
    });
  });

  it("o id listado é o que o cadastro de produto aceita (201)", async () => {
    const app = criarAppDeTeste();
    const { body } = await request(app).get("/classes-risco");
    const gases = body.dados.find((c: { codigo: string }) => c.codigo === "classe_2_gases");

    const res = await request(app)
      .post("/produtos-quimicos")
      .send({ nome: "Cloro Líquido", numeroONU: "UN1017", classeRisco: gases.id });
    expect(res.status).toBe(201);
    expect(res.body.dados.classeRisco).toEqual(gases);
  });
});

describe("API - Grupos de compatibilidade", () => {
  it("GET /grupos-compatibilidade lista os grupos com { id, codigo, descricao } (200)", async () => {
    const app = criarAppDeTeste();
    const res = await request(app).get("/grupos-compatibilidade");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    expect(res.body.dados).toContainEqual({ id: GRUPOS[0].id, codigo: "G1", descricao: "Ácidos" });
  });

  it("o id listado é o que o cadastro de produto aceita (201)", async () => {
    const app = criarAppDeTeste();
    const { body } = await request(app).get("/grupos-compatibilidade");
    const oxidantes = body.dados.find((g: { codigo: string }) => g.codigo === "G3");

    const res = await request(app)
      .post("/produtos-quimicos")
      .send({ ...produtoValido, gruposCompatibilidade: [oxidantes.id] });
    expect(res.status).toBe(201);
    expect(res.body.dados.gruposCompatibilidade).toEqual([oxidantes]);
  });
});

describe("API - Responsáveis técnicos", () => {
  describe("POST /responsaveis-tecnicos", () => {
    it("cadastra responsável (201), com status ativo", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/responsaveis-tecnicos").send(responsavelValido);

      expect(res.status).toBe(201);
      expect(res.headers.location).toBe(`/responsaveis-tecnicos/${res.body.dados.id}`);
      expect(res.body.dados).toMatchObject({ ...responsavelValido, status: "ativo" });
    });

    it("só o nome é obrigatório (201)", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).post("/responsaveis-tecnicos").send({ nome: "Eng. Ana Prado" });
      expect(res.status).toBe(201);
    });

    it("bloqueia cadastro sem nome (400)", async () => {
      const app = criarAppDeTeste();
      const { nome: _n, ...semNome } = responsavelValido;
      const res = await request(app).post("/responsaveis-tecnicos").send(semNome);

      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes).toContainEqual({ local: "body", campo: "nome", mensagem: "nome é obrigatório" });
    });

    it.each([
      ["email", "nao-e-email"],
      ["cpf", "123"],
      ["status", "inativo"],
    ])("bloqueia %s inválido (400)", async (campo, valor) => {
      const app = criarAppDeTeste();
      const res = await request(app)
        .post("/responsaveis-tecnicos")
        .send({ ...responsavelValido, [campo]: valor });
      expect(res.status).toBe(400);
      expect(res.body.erro.detalhes[0].campo).toBe(campo);
    });
  });

  describe("GET /responsaveis-tecnicos", () => {
    it("lista os responsáveis cadastrados (200)", async () => {
      const app = criarAppDeTeste();
      await request(app).post("/responsaveis-tecnicos").send(responsavelValido);

      const res = await request(app).get("/responsaveis-tecnicos");
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2); // RESPONSAVEL (já cadastrado nos helpers) + o novo
    });

    it("busca por id (200) e retorna 404 se não existir", async () => {
      const app = criarAppDeTeste();
      const res = await request(app).get(`/responsaveis-tecnicos/${RESPONSAVEL.id}`);
      expect(res.status).toBe(200);
      expect(res.body.dados).toMatchObject(RESPONSAVEL);

      const inexistente = await request(app).get(`/responsaveis-tecnicos/${ID_INEXISTENTE}`);
      expect(inexistente.status).toBe(404);
      expect(inexistente.body.erro.codigo).toBe("RESPONSAVEL_TECNICO_NAO_ENCONTRADO");
    });
  });

  it("o id do responsável cadastrado é aceito no registro de carga (201)", async () => {
    const app = criarAppDeTeste();
    const novo = await request(app).post("/responsaveis-tecnicos").send(responsavelValido);
    const produtoId = await criarProduto(app);

    const res = await request(app)
      .post("/cargas-quimicas")
      .send({ ...cargaValida(produtoId), responsavelTecnico: novo.body.dados.id });

    expect(res.status).toBe(201);
    expect(res.body.dados.responsavelTecnico).toEqual({ id: novo.body.dados.id, nome: responsavelValido.nome });
  });
});
