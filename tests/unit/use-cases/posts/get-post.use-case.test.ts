import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Post } from "../../../../src/domain/entities/post.entity";
import type { PostRepository } from "../../../../src/domain/repositories/post.repository";
import { GetPostUseCase } from "../../../../src/application/use-cases/posts/get-post.use-case";
import { AppError } from "../../../../src/shared/errors/app-error";

describe("GetPostUseCase", () => {
  let postRepository: PostRepository;
  let useCase: GetPostUseCase;

  beforeEach(() => {
    postRepository = {
      create: vi.fn(),
      findPublished: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new GetPostUseCase(postRepository);
  });

  it("should return a published post", async () => {
    const publishedPost: Post = {
      id: "post-uuid",
      title: "Título",
      slug: "titulo",
      content: "Contenido",
      authorId: "author-uuid",
      status: "published",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(postRepository.findBySlug).mockResolvedValue(publishedPost);

    const result = await useCase.execute("titulo");

    expect(result).toEqual(publishedPost);
  });

  it("should throw NotFoundError when post does not exist", async () => {
    vi.mocked(postRepository.findBySlug).mockResolvedValue(null);

    await expect(useCase.execute("titulo")).rejects.toThrow(AppError);
    await expect(useCase.execute("titulo")).rejects.toThrow(
      "Publicación no encontrada",
    );
  });

  it("should throw NotFoundError when post is draft", async () => {
    const draftPost: Post = {
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

    vi.mocked(postRepository.findBySlug).mockResolvedValue(draftPost);

    await expect(useCase.execute("titulo")).rejects.toThrow(AppError);
    await expect(useCase.execute("titulo")).rejects.toThrow(
      "Publicación no encontrada",
    );
  });
});
