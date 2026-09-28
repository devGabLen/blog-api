import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

import { authMiddleware } from "../../../src/interfaces/http/middlewares/auth.middleware";
import { AppError } from "../../../src/shared/errors/app-error";

describe("authMiddleware", () => {
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    request = {
      headers: {},
    };
    response = {};
    next = vi.fn();
  });

  it("should call next with error when authorization header is missing", () => {
    authMiddleware(request as Request, response as Response, next);

    expect(next).toHaveBeenCalled();
    const error = vi.mocked(next).mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Se requiere un token de autenticación");
    expect(error.statusCode).toBe(401);
  });

  it("should call next with error when scheme is not Bearer", () => {
    request.headers = {
      authorization: "Basic token123",
    };

    authMiddleware(request as Request, response as Response, next);

    expect(next).toHaveBeenCalled();
    const error = vi.mocked(next).mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("El formato del token de autenticación no es válido");
    expect(error.statusCode).toBe(401);
  });

  it("should call next with error when token is missing", () => {
    request.headers = {
      authorization: "Bearer",
    };

    authMiddleware(request as Request, response as Response, next);

    expect(next).toHaveBeenCalled();
    const error = vi.mocked(next).mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("El formato del token de autenticación no es válido");
    expect(error.statusCode).toBe(401);
  });

  it("should call next with error when token is invalid", () => {
    request.headers = {
      authorization: "Bearer invalid-token",
    };

    authMiddleware(request as Request, response as Response, next);

    expect(next).toHaveBeenCalled();
    const error = vi.mocked(next).mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("El token de autenticación es inválido o expiró");
    expect(error.statusCode).toBe(401);
  });
});
