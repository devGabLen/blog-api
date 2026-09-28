import { describe, it, expect, vi, beforeEach } from "vitest";

import type { CreateCommentDto } from "../../../../src/application/dtos/comment.dto";
import type { Comment } from "../../../../src/domain/entities/comment.entity";
import type { CommentRepository } from "../../../../src/domain/repositories/comment.repository";
import type { PostRepository } from "../../../../src/domain/repositories/post.repository";
import { CreateCommentUseCase } from "../../../../src/application/use-cases/comments/create-comment.use-case";
import { AppError } from "../../../../src/shared/errors/app-error";

describe("CreateCommentUseCase", () => {
  let commentRepository: CommentRepository;
  let postRepository: PostRepository;
  let notificationService: { notifyNewComment: ReturnType<typeof vi.fn> };
  let useCase: CreateCommentUseCase;

  beforeEach(() => {
    commentRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPostId: vi.fn(),
      delete: vi.fn(),
    };
    postRepository = {
      create: vi.fn(),
      findPublished: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    notificationService = {
      notifyNewComment: vi.fn(),
    };
    useCase = new CreateCommentUseCase(commentRepository, postRepository, notificationService);
  });

  it("should create a comment successfully", async () => {
    const input: CreateCommentDto = {
      content: "Gran post!",
    };

    vi.mocked(postRepository.findById).mockResolvedValue({
      id: "post-uuid",
      title: "Título",
      slug: "titulo",
      content: "Contenido",
      authorId: "author-uuid",
      status: "published",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockComment: Comment = {
      id: "comment-uuid",
      content: "Gran post!",
      postId: "post-uuid",
      authorId: "comment-author-uuid",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(commentRepository.create).mockResolvedValue(mockComment);

    const result = await useCase.execute(input, "post-uuid", "comment-author-uuid");

    expect(result).toEqual(mockComment);
    expect(commentRepository.create).toHaveBeenCalled();
  });

  it("should throw NotFoundError when post does not exist", async () => {
    const input: CreateCommentDto = {
      content: "Gran post!",
    };

    vi.mocked(postRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute(input, "post-uuid", "author-uuid")).rejects.toThrow(AppError);
    await expect(useCase.execute(input, "post-uuid", "author-uuid")).rejects.toThrow(
      "La publicación no existe",
    );
  });

  it("should trim comment content", async () => {
    const input: CreateCommentDto = {
      content: "  Gran post!  ",
    };

    vi.mocked(postRepository.findById).mockResolvedValue({
      id: "post-uuid",
      title: "Título",
      slug: "titulo",
      content: "Contenido",
      authorId: "author-uuid",
      status: "published",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockComment: Comment = {
      id: "comment-uuid",
      content: "Gran post!",
      postId: "post-uuid",
      authorId: "comment-author-uuid",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(commentRepository.create).mockResolvedValue(mockComment);

    await useCase.execute(input, "post-uuid", "comment-author-uuid");

    expect(commentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Gran post!" }),
    );
  });
});
