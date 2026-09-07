import { Router } from "express";

import { LoginUserUseCase } from "../../../application/use-cases/auth/login-user.use-case";
import { RegisterUserUseCase } from "../../../application/use-cases/auth/register-user.use-case";
import { PostgresUserRepository } from "../../../infrastructure/database/repositories/postgres-user.repository";
import {
  comparePassword,
  hashPassword,
} from "../../../infrastructure/security/password.service";
import { generateAccessToken } from "../../../infrastructure/security/token.service";
import { AuthController } from "../controllers/auth.controller";

const userRepository = new PostgresUserRepository();

const registerUserUseCase = new RegisterUserUseCase(userRepository, {
  hash: hashPassword,
});

const loginUserUseCase = new LoginUserUseCase(userRepository, {
  compare: comparePassword,
});

const authController = new AuthController(
  registerUserUseCase,
  loginUserUseCase,
  {
    generate: generateAccessToken,
  },
);

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
