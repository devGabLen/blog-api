import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { ZodError } from "zod";

import { errorMiddleware } from "../../../src/interfaces/http/middlewares/error.middleware";
import { AppError } from "../../../src/shared/errors/app-error";

describe("errorMiddleware", () => {
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: () => void;

  beforeEach(() => {
    request = {};
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it("should handle ZodError with 422 status", () => {
    const zodError = new ZodError([
      {
        code: "too_small",
        minimum: 8,
        type: "string",
        inclusive: true,
        exact: false,
        message: "String must contain at least 8 character(s)",
        path: ["password"],
      },
    ]);

    errorMiddleware(
      zodError,
      request as Request,
      response as Response,
      next,
    );

    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        message: "Los datos enviados no son válidos",
        details: expect.any(Object),
      }),
    );
  });

  it("should handle AppError with correct status code", () => {
    const appError = new AppError("Recurso no encontrado", 404);

    errorMiddleware(
      appError,
      request as Request,
      response as Response,
      next,
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        message: "Recurso no encontrado",
      }),
    );
  });

  it("should handle generic errors with 500 status", () => {
    const genericError = new Error("Error inesperado");

    errorMiddleware(
      genericError,
      request as Request,
      response as Response,
      next,
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        message: "Error interno del servidor",
      }),
    );
  });
});
