import type { RequestHandler } from "express";

import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

export const notFoundMiddleware: RequestHandler = (
  request,
  _response,
  next,
) => {
  next(
    new AppError(
      `No se encontró la ruta ${request.method} ${request.originalUrl}`,
      HTTP_STATUS.NOT_FOUND,
    ),
  );
};
