import type { User } from "../../../domain/entities/user.entity";
import type { UserRepository } from "../../../domain/repositories/user.repository";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";
import { database } from "../../../config/database";

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export class PostgresUserRepository implements UserRepository {
  async create(user: User): Promise<User> {
    const query = `
      INSERT INTO users (
        id,
        name,
        email,
        password_hash,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        name,
        email,
        password_hash,
        created_at,
        updated_at;
    `;

    const values = [
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.createdAt,
      user.updatedAt,
    ];

    try {
      const result = await database.query<UserRow>(query, values);

      return toUser(result.rows[0]);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError(
          "Ya existe una cuenta registrada con este email",
          HTTP_STATUS.CONFLICT,
        );
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT
        id,
        name,
        email,
        password_hash,
        created_at,
        updated_at
      FROM users
      WHERE email = $1
      LIMIT 1;
    `;

    const result = await database.query<UserRow>(query, [email]);
    const row = result.rows[0];

    return row ? toUser(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT
        id,
        name,
        email,
        password_hash,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;

    const result = await database.query<UserRow>(query, [id]);
    const row = result.rows[0];

    return row ? toUser(row) : null;
  }
}
