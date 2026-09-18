/**
 * Erro de domínio genérico, usado para violações de regra de negócio.
 * Responsável: Paula
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}
