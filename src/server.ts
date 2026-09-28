import { app } from "./app";
import { database } from "./config/database";
import { logger } from "./config/logger";
import { env } from "./config/env";
import { NotificationService } from "./infrastructure/notifications/notification.service";

const server = app.listen(env.PORT, () => {
  logger.info(`Servidor iniciado en http://localhost:${env.PORT}`);
});

const notificationService = NotificationService.getInstance();
notificationService.initialize(server);

function gracefulShutdown(signal: string): void {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await database.end();
      logger.info("Database pool closed");
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, "Error during shutdown");
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
