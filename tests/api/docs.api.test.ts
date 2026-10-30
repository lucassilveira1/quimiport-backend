// Testes HTTP da documentação da API (Swagger UI e contrato OpenAPI).
import request from "supertest";
import { criarAppDeTeste } from "./helpers";

describe("API - Documentação", () => {
  it("GET /docs/ abre o Swagger UI (200, HTML)", async () => {
    const app = criarAppDeTeste();
    const res = await request(app).get("/docs/");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.text).toContain("swagger-ui");
  });

  it("GET /docs/openapi.json documenta todos os endpoints da API", async () => {
    const app = criarAppDeTeste();
    const res = await request(app).get("/docs/openapi.json");

    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);

    const operacoes = Object.entries(res.body.paths as Record<string, Record<string, unknown>>).flatMap(
      ([caminho, metodos]) =>
        Object.keys(metodos)
          .filter((metodo) => metodo !== "parameters")
          .map((metodo) => `${metodo.toUpperCase()} ${caminho}`)
    );
    expect(operacoes.sort()).toEqual(
      [
        "GET /health",
        "GET /classes-risco",
        "GET /grupos-compatibilidade",
        "POST /responsaveis-tecnicos",
        "GET /responsaveis-tecnicos",
        "GET /responsaveis-tecnicos/{id}",
        "POST /produtos-quimicos",
        "GET /produtos-quimicos",
        "GET /produtos-quimicos/{id}",
        "PUT /produtos-quimicos/{id}",
        "PATCH /produtos-quimicos/{id}/inativar",
        "PATCH /produtos-quimicos/{id}/ativar",
        "POST /cargas-quimicas",
        "GET /cargas-quimicas",
        "GET /cargas-quimicas/{id}",
        "PATCH /cargas-quimicas/{id}/status",
        "PATCH /cargas-quimicas/{id}/liberar",
        "PATCH /cargas-quimicas/{id}/bloquear",
        "PATCH /cargas-quimicas/{id}/cancelar",
      ].sort()
    );
  });
});
