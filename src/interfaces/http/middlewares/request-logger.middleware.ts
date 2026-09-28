import { logger } from "../../../config/logger";

export function requestLogger(request: any, response: any, next: () => void): void {
  const start = Date.now();

  response.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: request.method,
      url: request.originalUrl,
      status: response.statusCode,
      duration: `${duration}ms`,
      ip: request.ip,
      userAgent: request.get("user-agent"),
    };

    if (response.statusCode >= 400) {
      logger.warn(logData, "Request completed with error");
    } else {
      logger.info(logData, "Request completed");
    }
  });

  next();
}
