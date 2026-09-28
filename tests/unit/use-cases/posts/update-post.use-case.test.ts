import { describe, it, expect, vi, beforeEach } from "vitest";

import type { UpdatePostDto } from "../../../../src/application/dtos/post.dto";
import type { Post } from "../../../../src/domain/entities/post.entity";
import type { PostRepository } from "../../../../src/domain/repositories/post.repository";
import { UpdatePostUseCase } from "../../../../src/application/use-cases/posts/update-post.use-case";
import { AppError } from "../../../../src/shared/errors/app-error";

describe("UpdatePostUseCase", () => {
  let postRepository: PostRepository;
  let useCase: UpdatePostUseCase;

  const existingPost: Post = {
    id: "post-uuid",
    title: "Título original",
    slug: "titulo-original",
    content: "Contenido original",
    authorId: "author-uuid",
    status: "draft",
    publishedAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
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
    useCase = new UpdatePostUseCase(postRepository);
  });

  it("should update post title", async () => {
    const input: UpdatePostDto = {
      title: "Nuevo título",
    };

    vi.mocked(postRepository.findById).mockResolvedValue(existingPost);
    vi.mocked(postRepository.update).mockImplementation(async (post) => post);

    const result = await useCase.execute("post-uuid", input, "author-uuid");

    expect(result.title).toBe("Nuevo título");
    expect(result.content).toBe("Contenido original");
  });

  it("should update post content", async () => {
    const input: UpdatePostDto = {
      content: "Nuevo contenido",
    };

    vi.mocked(postRepository.findById).mockResolvedValue(existingPost);
    vi.mocked(postRepository.update).mockImplementation(async (post) => post);

    const result = await useCase.execute("post-uuid", input, "author-uuid");

    expect(result.title).toBe("Título original");
    expect(result.content).toBe("Nuevo contenido");
  });

  it("should update post status to published", async () => {
    const input: UpdatePostDto = {
      status: "published",
    };

    vi.mocked(postRepository.findById).mockResolvedValue(existingPost);
    vi.mocked(postRepository.update).mockImplementation(async (post) => post);

    const result = await useCase.execute("post-uuid", input, "author-uuid");

    expect(result.status).toBe("published");
    expect(result.publishedAt).not.toBeNull();
  });

  it("should update post status to draft", async () => {
    const publishedPost: Post = {
      ...existingPost,
      status: "published",
      publishedAt: new Date("2024-01-15"),
    };

    const input: UpdatePostDto = {
      status: "draft",
    };

    vi.mocked(postRepository.findById).mockResolvedValue(publishedPost);
    vi.mocked(postRepository.update).mockImplementation(async (post) => post);

    const result = await useCase.execute("post-uuid", input, "author-uuid");

    expect(result.status).toBe("draft");
    expect(result.publishedAt).toBeNull();
  });

  it("should throw NotFoundError when post does not exist", async () => {
    const input: UpdatePostDto = {
      title: "Nuevo título",
    };

    vi.mocked(postRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute("post-uuid", input, "author-uuid")).rejects.toThrow(AppError);
    await expect(useCase.execute("post-uuid", input, "author-uuid")).rejects.toThrow(
      "Publicación no encontrada",
    );
  });

  it("should throw ForbiddenError when user is not the author", async () => {
    const input: UpdatePostDto = {
      title: "Nuevo título",
    };

    vi.mocked(postRepository.findById).mockResolvedValue(existingPost);

    await expect(useCase.execute("post-uuid", input, "other-author-uuid")).rejects.toThrow(AppError);
    await expect(useCase.execute("post-uuid", input, "other-author-uuid")).rejects.toThrow(
      "No tienes permiso para modificar esta publicación",
    );
  });
});
