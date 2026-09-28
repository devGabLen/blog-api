import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Post } from "../../../../src/domain/entities/post.entity";
import type { PostRepository } from "../../../../src/domain/repositories/post.repository";
import { ListPostsUseCase } from "../../../../src/application/use-cases/posts/list-posts.use-case";

describe("ListPostsUseCase", () => {
  let postRepository: PostRepository;
  let useCase: ListPostsUseCase;

  beforeEach(() => {
    postRepository = {
      create: vi.fn(),
      findPublished: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new ListPostsUseCase(postRepository);
  });

  it("should return all published posts", async () => {
    const posts: Post[] = [
      {
        id: "post-1",
        title: "Post 1",
        slug: "post-1",
        content: "Contenido 1",
        authorId: "author-uuid",
        status: "published",
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "post-2",
        title: "Post 2",
        slug: "post-2",
        content: "Contenido 2",
        authorId: "author-uuid",
        status: "published",
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(postRepository.findPublished).mockResolvedValue(posts);

    const result = await useCase.execute();

    expect(result).toEqual(posts);
    expect(result).toHaveLength(2);
  });

  it("should return empty array when no posts exist", async () => {
    vi.mocked(postRepository.findPublished).mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
