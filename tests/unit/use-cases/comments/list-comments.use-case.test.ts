import { describe, it, expect, vi, beforeEach } from "vitest";

import type { Comment } from "../../../../src/domain/entities/comment.entity";
import type { CommentRepository } from "../../../../src/domain/repositories/comment.repository";
import { ListCommentsUseCase } from "../../../../src/application/use-cases/comments/list-comments.use-case";

describe("ListCommentsUseCase", () => {
  let commentRepository: CommentRepository;
  let useCase: ListCommentsUseCase;

  beforeEach(() => {
    commentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPostId: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new ListCommentsUseCase(commentRepository);
  });

  it("should return all comments for a post", async () => {
    const comments: Comment[] = [
      {
        id: "comment-1",
        content: "Primer comentario",
        postId: "post-uuid",
        authorId: "author-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "comment-2",
        content: "Segundo comentario",
        postId: "post-uuid",
        authorId: "author-2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(commentRepository.findByPostId).mockResolvedValue(comments);

    const result = await useCase.execute("post-uuid");

    expect(result).toEqual(comments);
    expect(result).toHaveLength(2);
  });

  it("should return empty array when no comments exist", async () => {
    vi.mocked(commentRepository.findByPostId).mockResolvedValue([]);

    const result = await useCase.execute("post-uuid");

    expect(result).toEqual([]);
  });
});
