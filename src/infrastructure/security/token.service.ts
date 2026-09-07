import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../../config/env";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (typeof payload === "string" || !payload.sub || !payload.email) {
    throw new Error("El token no contiene un payload válido");
  }

  return payload as AccessTokenPayload;
}
