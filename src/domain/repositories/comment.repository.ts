import type { Comment } from "../entities/comment.entity";
import type { PaginatedResult, PaginationParams } from "../../application/dtos/comment.dto";

export interface CommentRepository {
  create(comment: Comment): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByPostId(postId: string, params?: PaginationParams): Promise<PaginatedResult<Comment>>;
  delete(id: string): Promise<void>;
}
