import { describe, it, expect, vi, beforeEach } from "vitest";

import type { CreatePostDto } from "../../../../src/application/dtos/post.dto";
import type { Post } from "../../../../src/domain/entities/post.entity";
import type { PostRepository } from "../../../../src/domain/repositories/post.repository";
import { CreatePostUseCase } from "../../../../src/application/use-cases/posts/create-post.use-case";
import { AppError } from "../../../../src/shared/errors/app-error";

describe("CreatePostUseCase", () => {
  let postRepository: PostRepository;
  let useCase: CreatePostUseCase;

  beforeEach(() => {
    postRepository = {
      create: vi.fn(),
      findPublished: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new CreatePostUseCase(postRepository);
  });

  it("should create a post with draft status", async () => {
    const input: CreatePostDto = {
      title: "Mi primer post",
      content: "Contenido del post",
      status: "draft",
    };

    vi.mocked(postRepository.findBySlug).mockResolvedValue(null);

    const mockPost: Post = {
      id: "uuid-123",
      title: "Mi primer post",
      slug: "mi-primer-post",
      content: "Contenido del post",
      authorId: "author-uuid",
      status: "draft",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(postRepository.create).mockResolvedValue(mockPost);

    const result = await useCase.execute(input, "author-uuid");

    expect(result).toEqual(mockPost);
    expect(result.status).toBe("draft");
    expect(result.publishedAt).toBeNull();
  });

  it("should create a post with published status", async () => {
    const input: CreatePostDto = {
      title: "Mi post publicado",
      content: "Contenido del post",
      status: "published",
    };

    vi.mocked(postRepository.findBySlug).mockResolvedValue(null);

    const mockPost: Post = {
      id: "uuid-123",
      title: "Mi post publicado",
      slug: "mi-post-publicado",
      content: "Contenido del post",
      authorId: "author-uuid",
      status: "published",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(postRepository.create).mockResolvedValue(mockPost);

    const result = await useCase.execute(input, "author-uuid");

    expect(result.status).toBe("published");
    expect(result.publishedAt).not.toBeNull();
  });

  it("should generate unique slug when slug already exists", async () => {
    const input: CreatePostDto = {
      title: "Mi primer post",
      content: "Contenido del post",
      status: "draft",
    };

    const existingPost: Post = {
      id: "uuid-existing",
      title: "Mi primer post",
      slug: "mi-primer-post",
      content: "Contenido existente",
      authorId: "other-author",
      status: "published",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(postRepository.findBySlug)
      .mockResolvedValueOnce(existingPost)
      .mockResolvedValueOnce(null);

    const mockPost: Post = {
      id: "uuid-123",
      title: "Mi primer post",
      slug: "mi-primer-post-2",
      content: "Contenido del post",
      authorId: "author-uuid",
      status: "draft",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(postRepository.create).mockResolvedValue(mockPost);

    const result = await useCase.execute(input, "author-uuid");

    expect(result.slug).toBe("mi-primer-post-2");
    expect(postRepository.findBySlug).toHaveBeenCalledTimes(2);
  });

  it("should throw UnprocessableEntityError when title has no valid characters", async () => {
    const input: CreatePostDto = {
      title: "!!!",
      content: "Contenido del post",
      status: "draft",
    };

    await expect(useCase.execute(input, "author-uuid")).rejects.toThrow(AppError);
    await expect(useCase.execute(input, "author-uuid")).rejects.toThrow(
      "El título debe contener letras o números",
    );
  });
});
