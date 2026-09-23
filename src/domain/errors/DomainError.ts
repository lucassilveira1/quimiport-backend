/**
 * Erro de domínio. Toda violação de regra de negócio lança um DomainError,
 * nunca um Error genérico — isso permite que a camada HTTP (Vitor) mapeie
 * cada `code` para um status HTTP apropriado sem conhecer os detalhes do domínio.
 */
export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
