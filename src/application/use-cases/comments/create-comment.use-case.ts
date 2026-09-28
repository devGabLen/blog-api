import { randomUUID } from "node:crypto";

import type { CreateCommentDto } from "../../dtos/comment.dto";
import type { Comment } from "../../../domain/entities/comment.entity";
import type { CommentRepository } from "../../../domain/repositories/comment.repository";
import type { PostRepository } from "../../../domain/repositories/post.repository";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";
import { sanitizeContent } from "../../../shared/utils/sanitize";
import { NotificationService } from "../../../infrastructure/notifications/notification.service";

export class CreateCommentUseCase {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(
    input: CreateCommentDto,
    postId: string,
    authorId: string,
  ): Promise<Comment> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new AppError(
        "La publicación no existe",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const now = new Date();
    const comment: Comment = {
      id: randomUUID(),
      content: sanitizeContent(input.content.trim()),
      postId,
      authorId,
      createdAt: now,
      updatedAt: now,
    };

    const createdComment = await this.commentRepository.create(comment);

    if (post.authorId !== authorId) {
      this.notificationService.notifyNewComment(post.authorId, {
        id: createdComment.id,
        content: createdComment.content,
        postId,
      });
    }

    return createdComment;
  }
}
