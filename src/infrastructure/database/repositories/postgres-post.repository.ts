import { database } from "../../../config/database";
import type { Post, PostStatus } from "../../../domain/entities/post.entity";
import type { PostRepository } from "../../../domain/repositories/post.repository";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  status: PostStatus;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    authorId: row.author_id,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function hasPostgresCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

export class PostgresPostRepository implements PostRepository {
  async create(post: Post): Promise<Post> {
    const query = `
      INSERT INTO posts (
        id,
        title,
        slug,
        content,
        author_id,
        status,
        published_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        title,
        slug,
        content,
        author_id,
        status,
        published_at,
        created_at,
        updated_at;
    `;

    const values = [
      post.id,
      post.title,
      post.slug,
      post.content,
      post.authorId,
      post.status,
      post.publishedAt,
      post.createdAt,
      post.updatedAt,
    ];

    try {
      const result = await database.query<PostRow>(query, values);

      return toPost(result.rows[0]);
    } catch (error) {
      if (hasPostgresCode(error, "23505")) {
        throw new AppError(
          "Ya existe una publicación con este slug",
          HTTP_STATUS.CONFLICT,
        );
      }

      throw error;
    }
  }

  async findPublished(): Promise<Post[]> {
    const query = `
      SELECT
        id,
        title,
        slug,
        content,
        author_id,
        status,
        published_at,
        created_at,
        updated_at
      FROM posts
      WHERE status = 'published'
      ORDER BY published_at DESC;
    `;

    const result = await database.query<PostRow>(query);

    return result.rows.map(toPost);
  }

  async findById(id: string): Promise<Post | null> {
    const query = `
      SELECT
        id,
        title,
        slug,
        content,
        author_id,
        status,
        published_at,
        created_at,
        updated_at
      FROM posts
      WHERE id = $1
      LIMIT 1;
    `;

    const result = await database.query<PostRow>(query, [id]);
    const row = result.rows[0];

    return row ? toPost(row) : null;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const query = `
      SELECT
        id,
        title,
        slug,
        content,
        author_id,
        status,
        published_at,
        created_at,
        updated_at
      FROM posts
      WHERE slug = $1
      LIMIT 1;
    `;

    const result = await database.query<PostRow>(query, [slug]);
    const row = result.rows[0];

    return row ? toPost(row) : null;
  }

  async update(post: Post): Promise<Post> {
    const query = `
      UPDATE posts
      SET
        title = $2,
        slug = $3,
        content = $4,
        status = $5,
        published_at = $6,
        updated_at = $7
      WHERE id = $1
      RETURNING
        id,
        title,
        slug,
        content,
        author_id,
        status,
        published_at,
        created_at,
        updated_at;
    `;

    const values = [
      post.id,
      post.title,
      post.slug,
      post.content,
      post.status,
      post.publishedAt,
      post.updatedAt,
    ];

    try {
      const result = await database.query<PostRow>(query, values);
      const row = result.rows[0];

      if (!row) {
        throw new AppError("Publicación no encontrada", HTTP_STATUS.NOT_FOUND);
      }

      return toPost(row);
    } catch (error) {
      if (hasPostgresCode(error, "23505")) {
        throw new AppError(
          "Ya existe una publicación con este slug",
          HTTP_STATUS.CONFLICT,
        );
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const query = "DELETE FROM posts WHERE id = $1;";
    const result = await database.query(query, [id]);

    if (result.rowCount === 0) {
      throw new AppError("Publicación no encontrada", HTTP_STATUS.NOT_FOUND);
    }
  }
}
