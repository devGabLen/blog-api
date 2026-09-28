import type { RequestHandler } from "express";

import { verifyAccessToken } from "../../../infrastructure/security/token.service";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

export const authMiddleware: RequestHandler = (request, _response, next) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) {
    return next(
      new AppError(
        "Se requiere un token de autenticación",
        HTTP_STATUS.UNAUTHORIZED,
      ),
    );
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(
      new AppError(
        "El formato del token de autenticación no es válido",
        HTTP_STATUS.UNAUTHORIZED,
      ),
    );
  }

  try {
    const payload = verifyAccessToken(token);

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    next(
      new AppError(
        "El token de autenticación es inválido o expiró",
        HTTP_STATUS.UNAUTHORIZED,
      ),
    );
  }
};
