import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Comment } from "../../../../src/domain/entities/comment.entity";
import type { CommentRepository } from "../../../../src/domain/repositories/comment.repository";
import { DeleteCommentUseCase } from "../../../../src/application/use-cases/comments/delete-comment.use-case";
import { AppError } from "../../../../src/shared/errors/app-error";

describe("DeleteCommentUseCase", () => {
  let commentRepository: CommentRepository;
  let useCase: DeleteCommentUseCase;

  const existingComment: Comment = {
    id: "comment-uuid",
    content: "Comentario",
    postId: "post-uuid",
    authorId: "author-uuid",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    commentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPostId: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new DeleteCommentUseCase(commentRepository);
  });

  it("should delete comment successfully", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(existingComment);
    vi.mocked(commentRepository.delete).mockResolvedValue(undefined);

    await useCase.execute("comment-uuid", "author-uuid");

    expect(commentRepository.delete).toHaveBeenCalledWith("comment-uuid");
  });

  it("should throw NotFoundError when comment does not exist", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute("comment-uuid", "author-uuid")).rejects.toThrow(AppError);
    await expect(useCase.execute("comment-uuid", "author-uuid")).rejects.toThrow(
      "Comentario no encontrado",
    );
  });

  it("should throw ForbiddenError when user is not the author", async () => {
    vi.mocked(commentRepository.findById).mockResolvedValue(existingComment);

    await expect(useCase.execute("comment-uuid", "other-author-uuid")).rejects.toThrow(AppError);
    await expect(useCase.execute("comment-uuid", "other-author-uuid")).rejects.toThrow(
      "No tienes permiso para eliminar este comentario",
    );
  });
});
