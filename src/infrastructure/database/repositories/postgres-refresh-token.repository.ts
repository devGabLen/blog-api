import { randomUUID } from "node:crypto";
import { database } from "../../../config/database";

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

function toRefreshToken(row: RefreshTokenRow): RefreshToken {
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export class PostgresRefreshTokenRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const id = randomUUID();
    const query = `
      INSERT INTO refresh_tokens (id, user_id, token, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, token, expires_at, created_at;
    `;
    const result = await database.query<RefreshTokenRow>(query, [id, userId, token, expiresAt]);
    return toRefreshToken(result.rows[0]);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const query = `
      SELECT id, user_id, token, expires_at, created_at
      FROM refresh_tokens
      WHERE token = $1
      LIMIT 1;
    `;
    const result = await database.query<RefreshTokenRow>(query, [token]);
    return result.rows[0] ? toRefreshToken(result.rows[0]) : null;
  }

  async deleteByToken(token: string): Promise<void> {
    await database.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await database.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
  }
}
