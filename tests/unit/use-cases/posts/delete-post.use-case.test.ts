import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Post } from "../../../../src/domain/entities/post.entity";
import type { PostRepository } from "../../../../src/domain/repositories/post.repository";
import { DeletePostUseCase } from "../../../../src/application/use-cases/posts/delete-post.use-case";
import { AppError } from "../../../../src/shared/errors/app-error";

describe("DeletePostUseCase", () => {
  let postRepository: PostRepository;
  let useCase: DeletePostUseCase;

  const existingPost: Post = {
    id: "post-uuid",
    title: "Título",
    slug: "titulo",
    content: "Contenido",
    authorId: "author-uuid",
    status: "draft",
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    postRepository = {
      create: vi.fn(),
      findPublished: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new DeletePostUseCase(postRepository);
  });

  it("should delete post successfully", async () => {
    vi.mocked(postRepository.findById).mockResolvedValue(existingPost);
    vi.mocked(postRepository.delete).mockResolvedValue(undefined);

    await useCase.execute("post-uuid", "author-uuid");

    expect(postRepository.delete).toHaveBeenCalledWith("post-uuid");
  });

  it("should throw NotFoundError when post does not exist", async () => {
    vi.mocked(postRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute("post-uuid", "author-uuid")).rejects.toThrow(AppError);
    await expect(useCase.execute("post-uuid", "author-uuid")).rejects.toThrow(
      "Publicación no encontrada",
    );
  });

  it("should throw ForbiddenError when user is not the author", async () => {
    vi.mocked(postRepository.findById).mockResolvedValue(existingPost);

    await expect(useCase.execute("post-uuid", "other-author-uuid")).rejects.toThrow(AppError);
    await expect(useCase.execute("post-uuid", "other-author-uuid")).rejects.toThrow(
      "No tienes permiso para eliminar esta publicación",
    );
  });
});
