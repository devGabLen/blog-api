import { database } from "../../../config/database";
import type { Post, PostStatus } from "../../../domain/entities/post.entity";
import type { PostRepository } from "../../../domain/repositories/post.repository";
import type { PaginatedResult, PaginationParams, SearchPostsParams } from "../../../application/dtos/post.dto";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
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
    imageUrl: row.image_url,
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
        image_url,
        author_id,
        status,
        published_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        title,
        slug,
        content,
        image_url,
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
      post.imageUrl,
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

  async findPublished(params?: PaginationParams): Promise<PaginatedResult<Post>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts
      WHERE status = 'published';
    `;

    const dataQuery = `
      SELECT
        id,
        title,
        slug,
        content,
        image_url,
        author_id,
        status,
        published_at,
        created_at,
        updated_at
      FROM posts
      WHERE status = 'published'
      ORDER BY published_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const [countResult, dataResult] = await Promise.all([
      database.query<{ total: string }>(countQuery),
      database.query<PostRow>(dataQuery, [limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows.map(toPost),
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

  async searchPublished(params: SearchPostsParams): Promise<PaginatedResult<Post>> {
    const { query, page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts
      WHERE status = 'published'
        AND search_vector @@ plainto_tsquery('spanish', $1);
    `;

    const dataQuery = `
      SELECT
        id,
        title,
        slug,
        content,
        author_id,
        status,
        published_at,
        created_at,
        updated_at,
        ts_rank(search_vector, plainto_tsquery('spanish', $1)) as rank
      FROM posts
      WHERE status = 'published'
        AND search_vector @@ plainto_tsquery('spanish', $1)
      ORDER BY rank DESC, published_at DESC
      LIMIT $2 OFFSET $3;
    `;

    const [countResult, dataResult] = await Promise.all([
      database.query<{ total: string }>(countQuery, [query]),
      database.query<PostRow>(dataQuery, [query, limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows.map(toPost),
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

  async findById(id: string): Promise<Post | null> {
    const query = `
      SELECT
        id,
        title,
        slug,
        content,
        image_url,
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
        image_url,
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
        image_url = $5,
        status = $6,
        published_at = $7,
        updated_at = $8
      WHERE id = $1
      RETURNING
        id,
        title,
        slug,
        content,
        image_url,
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
      post.imageUrl,
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
