import type { PostStatus } from "../../domain/entities/post.entity";

export interface CreatePostDto {
  title: string;
  content: string;
  status: PostStatus;
  imageUrl?: string;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  status?: PostStatus;
  imageUrl?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchPostsParams extends PaginationParams {
  query: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
