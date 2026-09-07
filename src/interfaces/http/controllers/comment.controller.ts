import type { Request, Response } from "express";

import type { CreateCommentUseCase } from "../../../application/use-cases/comments/create-comment.use-case";
import type { DeleteCommentUseCase } from "../../../application/use-cases/comments/delete-comment.use-case";
import type { ListCommentsUseCase } from "../../../application/use-cases/comments/list-comments.use-case";
import type { Comment } from "../../../domain/entities/comment.entity";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";
import {
  commentIdParamsSchema,
  createCommentSchema,
  postIdParamsSchema,
} from "../validators/comment.validator";

export class CommentController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
    private readonly listCommentsUseCase: ListCommentsUseCase,
  ) {}

  list = async (request: Request, response: Response): Promise<void> => {
    const { postId } = postIdParamsSchema.parse(request.params);
    const comments = await this.listCommentsUseCase.execute(postId);

    response.status(200).json({
      status: "success",
      data: {
        comments: comments.map((comment) => this.toResponseComment(comment)),
      },
    });
  };

  create = async (request: Request, response: Response): Promise<void> => {
    const { postId } = postIdParamsSchema.parse(request.params);
    const input = createCommentSchema.parse(request.body);
    const authorId = this.getAuthenticatedUserId(request);
    const comment = await this.createCommentUseCase.execute(
      input,
      postId,
      authorId,
    );

    response.status(201).json({
      status: "success",
      data: { comment: this.toResponseComment(comment) },
    });
  };

  delete = async (request: Request, response: Response): Promise<void> => {
    const { id } = commentIdParamsSchema.parse(request.params);
    const authorId = this.getAuthenticatedUserId(request);

    await this.deleteCommentUseCase.execute(id, authorId);
    response.status(204).send();
  };

  private getAuthenticatedUserId(request: Request): string {
    if (!request.user) {
      throw new AppError(
        "Se requiere un usuario autenticado",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    return request.user.id;
  }

  private toResponseComment(comment: Comment) {
    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      authorId: comment.authorId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
