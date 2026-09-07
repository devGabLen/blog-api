import type { CommentRepository } from "../../../domain/repositories/comment.repository";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

export class DeleteCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(commentId: string, authorId: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new AppError("Comentario no encontrado", HTTP_STATUS.NOT_FOUND);
    }

    if (comment.authorId !== authorId) {
      throw new AppError(
        "No tienes permiso para eliminar este comentario",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    await this.commentRepository.delete(commentId);
  }
}
