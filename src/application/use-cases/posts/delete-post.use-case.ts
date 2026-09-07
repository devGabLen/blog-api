import type { PostRepository } from "../../../domain/repositories/post.repository";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

export class DeletePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(postId: string, authorId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new AppError("Publicación no encontrada", HTTP_STATUS.NOT_FOUND);
    }

    if (post.authorId !== authorId) {
      throw new AppError(
        "No tienes permiso para eliminar esta publicación",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    await this.postRepository.delete(postId);
  }
}
