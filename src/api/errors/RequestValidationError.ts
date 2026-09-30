// Erro de formato da requisição (DTO inválido). Responsável: Vitor
// Diferente do DomainError (regra de negócio): este nasce na camada HTTP e vira 400.

export interface ErroDeCampo {
  local: "params" | "query" | "body";
  campo: string | null;
  mensagem: string;
}

export class RequestValidationError extends Error {
  readonly detalhes: ErroDeCampo[];

  constructor(detalhes: ErroDeCampo[]) {
    super("Dados de entrada inválidos");
    this.name = "RequestValidationError";
    this.detalhes = detalhes;
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
}
