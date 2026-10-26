/**
 * Referência a um item de cadastro (classe de risco, grupo de compatibilidade):
 * o id do registro, o código que o identifica (ex.: "classe_8_corrosivos", "G1")
 * e a descrição, quando houver.
 */
export interface Referencia {
  id: string;
  codigo: string;
  descricao?: string;
}
