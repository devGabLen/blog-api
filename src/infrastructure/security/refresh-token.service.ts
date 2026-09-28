import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import { PostgresRefreshTokenRepository } from "../database/repositories/postgres-refresh-token.repository";

const refreshTokenRepository = new PostgresRefreshTokenRepository();

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  role: "admin" | "author" | "reader";
  jti: string;
}

export async function generateRefreshToken(
  userId: string,
  email: string,
  role: "admin" | "author" | "reader",
): Promise<string> {
  const jti = randomUUID();
  const payload: RefreshTokenPayload = { sub: userId, email, role, jti };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await refreshTokenRepository.create(userId, token, expiresAt);
  return token;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const payload = jwt.verify(token, env.JWT_SECRET) as RefreshTokenPayload;

  if (typeof payload === "string" || !payload.sub || !payload.jti) {
    throw new Error("Refresh token inválido");
  }

  const storedToken = await refreshTokenRepository.findByToken(token);
  if (!storedToken) {
    throw new Error("Refresh token no encontrado o revocado");
  }

  if (storedToken.expiresAt < new Date()) {
    await refreshTokenRepository.deleteByToken(token);
    throw new Error("Refresh token expirado");
  }

  return payload;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await refreshTokenRepository.deleteByToken(token);
}
