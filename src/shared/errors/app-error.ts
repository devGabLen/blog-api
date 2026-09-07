import type { HttpStatusCode } from "./error-codes";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: HttpStatusCode,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}
