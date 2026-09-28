import type { Comment } from "../../../domain/entities/comment.entity";
import type { CommentRepository } from "../../../domain/repositories/comment.repository";
import type { PaginatedResult, PaginationParams } from "../../dtos/comment.dto";

export class ListCommentsUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(postId: string, params?: PaginationParams): Promise<PaginatedResult<Comment>> {
    return this.commentRepository.findByPostId(postId, params);
  }
}
