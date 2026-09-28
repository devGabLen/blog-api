import { database } from "../../../config/database";
import type { Comment } from "../../../domain/entities/comment.entity";
import type { CommentRepository } from "../../../domain/repositories/comment.repository";
import type { PaginatedResult, PaginationParams } from "../../../application/dtos/comment.dto";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

interface CommentRow {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: Date;
  updated_at: Date;
}

function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    content: row.content,
    postId: row.post_id,
    authorId: row.author_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresCommentRepository implements CommentRepository {
  async create(comment: Comment): Promise<Comment> {
    const query = `
			INSERT INTO comments (
				id, content, post_id, author_id, created_at, updated_at
			)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id, content, post_id, author_id, created_at, updated_at;
		`;

    try {
      const result = await database.query<CommentRow>(query, [
        comment.id,
        comment.content,
        comment.postId,
        comment.authorId,
        comment.createdAt,
        comment.updatedAt,
      ]);

      return toComment(result.rows[0]);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new AppError(
          "La publicación o el usuario no existen",
          HTTP_STATUS.NOT_FOUND,
        );
      }

      throw error;
    }
  }

  async findById(id: string): Promise<Comment | null> {
    const result = await database.query<CommentRow>(
      `
				SELECT id, content, post_id, author_id, created_at, updated_at
				FROM comments
				WHERE id = $1
				LIMIT 1;
			`,
      [id],
    );

    const row = result.rows[0];
    return row ? toComment(row) : null;
  }

  async findByPostId(postId: string, params?: PaginationParams): Promise<PaginatedResult<Comment>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM comments
      WHERE post_id = $1;
    `;

    const dataQuery = `
      SELECT id, content, post_id, author_id, created_at, updated_at
      FROM comments
      WHERE post_id = $1
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3;
    `;

    const [countResult, dataResult] = await Promise.all([
      database.query<{ total: string }>(countQuery, [postId]),
      database.query<CommentRow>(dataQuery, [postId, limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows.map(toComment),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async delete(id: string): Promise<void> {
    const result = await database.query("DELETE FROM comments WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new AppError("Comentario no encontrado", HTTP_STATUS.NOT_FOUND);
    }
  }
}

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23503"
  );
}
