import { randomUUID } from "node:crypto";

import type { CreateCommentDto } from "../../dtos/comment.dto";
import type { Comment } from "../../../domain/entities/comment.entity";
import type { CommentRepository } from "../../../domain/repositories/comment.repository";

export class CreateCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(
    input: CreateCommentDto,
    postId: string,
    authorId: string,
  ): Promise<Comment> {
    const now = new Date();
    const comment: Comment = {
      id: randomUUID(),
      content: input.content.trim(),
      postId,
      authorId,
      createdAt: now,
      updatedAt: now,
    };

    return this.commentRepository.create(comment);
  }
}
