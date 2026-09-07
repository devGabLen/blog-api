import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    response.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      status: "error",
      message: "Los datos enviados no son válidos",
      details: error.flatten().fieldErrors,
    });

    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      status: "error",
      message: error.message,
      ...(error.details !== undefined && { details: error.details }),
    });

    return;
  }

  console.error("Error no controlado:", error);

  response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: "Error interno del servidor",
  });
};
