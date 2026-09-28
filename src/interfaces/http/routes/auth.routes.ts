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
import { authRateLimiter } from "../middlewares/rate-limit.middleware";

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

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 72
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       409:
 *         description: Email ya registrado
 *       422:
 *         description: Datos inválidos
 */
authRouter.post("/register", authRateLimiter, authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 *       422:
 *         description: Datos inválidos
 */
authRouter.post("/login", authRateLimiter, authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refrescar access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *       401:
 *         description: Refresh token inválido o expirado
 */
authRouter.post("/refresh", authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 */
authRouter.post("/logout", authController.logout);
