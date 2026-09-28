import type { Request, Response } from "express";

import type { LoginUserUseCase } from "../../../application/use-cases/auth/login-user.use-case";
import type { RegisterUserUseCase } from "../../../application/use-cases/auth/register-user.use-case";
import type { User } from "../../../domain/entities/user.entity";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";
import {
  loginUserSchema,
  refreshTokenSchema,
  registerUserSchema,
} from "../validators/auth.validator";
import {
  generateRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../../../infrastructure/security/refresh-token.service";

export interface TokenGenerator {
  generate(payload: { sub: string; email: string; role: "admin" | "author" | "reader" }): string;
}

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  register = async (request: Request, response: Response): Promise<void> => {
    const input = registerUserSchema.parse(request.body);
    const user = await this.registerUserUseCase.execute(input);

    response.status(201).json({
      status: "success",
      data: {
        user: this.toResponseUser(user),
      },
    });
  };

  login = async (request: Request, response: Response): Promise<void> => {
    const input = loginUserSchema.parse(request.body);
    const user = await this.loginUserUseCase.execute(input);
    const accessToken = this.tokenGenerator.generate({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await generateRefreshToken(user.id, user.email, user.role);

    response.status(200).json({
      status: "success",
      data: {
        accessToken,
        refreshToken,
        user: this.toResponseUser(user),
      },
    });
  };

  refresh = async (request: Request, response: Response): Promise<void> => {
    const { refreshToken } = refreshTokenSchema.parse(request.body);

    try {
      const payload = await verifyRefreshToken(refreshToken);
      const accessToken = this.tokenGenerator.generate({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      });

      response.status(200).json({
        status: "success",
        data: { accessToken },
      });
    } catch {
      throw new AppError(
        "Refresh token inválido o expirado",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }
  };

  logout = async (request: Request, response: Response): Promise<void> => {
    const { refreshToken } = refreshTokenSchema.parse(request.body);
    await revokeRefreshToken(refreshToken);

    response.status(200).json({
      status: "success",
      message: "Sesión cerrada exitosamente",
    });
  };

  private toResponseUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
