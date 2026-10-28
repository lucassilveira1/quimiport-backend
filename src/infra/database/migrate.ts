// Aplica as migrations pendentes (src/infra/migrations) no banco do DATABASE_URL.
// Roda no start do container, antes do servidor (ver Dockerfile).
// Migrations já aplicadas ficam registradas no banco e não rodam de novo.
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { logger } from "../../config/logger";

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não foi definida nas variáveis de ambiente.");
  }

  // Conexão própria e única: é fechada no fim para o processo terminar e o servidor subir.
  // onnotice: ignora os avisos do Postgres ("já existe, pulando") que poluem o log.
  const client = postgres(connectionString, { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(client), { migrationsFolder: "src/infra/migrations" });
    logger.info("Migrations aplicadas.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  logger.error("Falha ao aplicar as migrations.", err);
  process.exit(1);
});
