import type { UpdatePostDto } from "../../dtos/post.dto";
import type { Post } from "../../../domain/entities/post.entity";
import type { PostRepository } from "../../../domain/repositories/post.repository";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

export class UpdatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(
    postId: string,
    input: UpdatePostDto,
    authorId: string,
  ): Promise<Post> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new AppError("Publicación no encontrada", HTTP_STATUS.NOT_FOUND);
    }

    if (post.authorId !== authorId) {
      throw new AppError(
        "No tienes permiso para modificar esta publicación",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const status = input.status ?? post.status;
    const now = new Date();

    const updatedPost: Post = {
      ...post,
      title: input.title?.trim() ?? post.title,
      content: input.content?.trim() ?? post.content,
      status,
      publishedAt: this.resolvePublishedAt(post, status, now),
      updatedAt: now,
    };

    return this.postRepository.update(updatedPost);
  }

  private resolvePublishedAt(
    post: Post,
    status: Post["status"],
    now: Date,
  ): Date | null {
    if (status === "draft") {
      return null;
    }

    return post.publishedAt ?? now;
  }
}
