import type { Post } from "../entities/post.entity";
import type { PaginatedResult, PaginationParams, SearchPostsParams } from "../../application/dtos/post.dto";

export interface PostRepository {
  create(post: Post): Promise<Post>;
  findPublished(params?: PaginationParams): Promise<PaginatedResult<Post>>;
  searchPublished(params: SearchPostsParams): Promise<PaginatedResult<Post>>;
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<Post | null>;
  update(post: Post): Promise<Post>;
  delete(id: string): Promise<void>;
}
