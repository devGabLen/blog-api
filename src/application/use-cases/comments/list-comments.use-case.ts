import type { Comment } from "../../../domain/entities/comment.entity";
import type { CommentRepository } from "../../../domain/repositories/comment.repository";

export class ListCommentsUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(postId: string): Promise<Comment[]> {
    return this.commentRepository.findByPostId(postId);
  }
}
