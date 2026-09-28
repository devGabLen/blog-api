import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";

import { notFoundMiddleware } from "../../../src/interfaces/http/middlewares/not-found.middleware";
import { AppError } from "../../../src/shared/errors/app-error";

describe("notFoundMiddleware", () => {
  it("should call next with 404 error", () => {
    const request = {
      method: "GET",
      originalUrl: "/api/non-existent",
    } as Request;
    const response = {} as Response;
    const next = vi.fn();

    notFoundMiddleware(request, response, next);

    expect(next).toHaveBeenCalled();
    const error = vi.mocked(next).mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("No se encontró la ruta GET /api/non-existent");
    expect(error.statusCode).toBe(404);
  });
});
