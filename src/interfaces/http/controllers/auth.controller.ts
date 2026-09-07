import type { Request, Response } from "express";

import type { LoginUserUseCase } from "../../../application/use-cases/auth/login-user.use-case";
import type { RegisterUserUseCase } from "../../../application/use-cases/auth/register-user.use-case";
import type { User } from "../../../domain/entities/user.entity";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validators/auth.validator";

export interface TokenGenerator {
  generate(payload: { sub: string; email: string }): string;
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
    });

    response.status(200).json({
      status: "success",
      data: {
        accessToken,
        user: this.toResponseUser(user),
      },
    });
  };

  private toResponseUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
