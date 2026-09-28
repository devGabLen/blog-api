import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { database } from "./database";
import { logger } from "./logger";

export async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname, "../infrastructure/database/migrations");

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  logger.info(`Ejecutando ${files.length} migraciones...`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = readFileSync(filePath, "utf-8");

    try {
      await database.query(sql);
      logger.info(`Migración ejecutada: ${file}`);
    } catch (error) {
      const pgError = error as { code?: string; message?: string };
      if (pgError.code === "42P07" || pgError.code === "42710") {
        logger.warn(`Migración ya existe: ${file}`);
      } else {
        logger.error({ err: error }, `Error en migración ${file}`);
        throw error;
      }
    }
  }

  logger.info("Migraciones completadas exitosamente");
}
