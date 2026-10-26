/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  // Testes de integração precisam do Postgres: rodam à parte com `npm run test:integration`.
  testPathIgnorePatterns: ["/node_modules/", "\.integration\.test\.ts$"],
};
