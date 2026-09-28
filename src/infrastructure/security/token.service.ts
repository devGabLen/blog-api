import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";
import { HTTP_STATUS } from "../../shared/errors/error-codes";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: "admin" | "author" | "reader";
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (typeof payload === "string" || !payload.sub || !payload.email) {
    throw new AppError(
      "El token no contiene un payload válido",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  return payload as AccessTokenPayload;
}
