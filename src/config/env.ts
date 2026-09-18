// Centraliza a leitura de variáveis de ambiente.
import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || "",
  nodeEnv: process.env.NODE_ENV || "development",
};
