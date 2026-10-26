/** @type {import('jest').Config} */
// Testes de integração: usam o Postgres de verdade (DATABASE_URL do .env).
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.integration.test.ts"],
  setupFiles: ["dotenv/config"],
  // O schema importa com extensão ".js" (padrão NodeNext); no Jest, aponta para o .ts.
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
};
