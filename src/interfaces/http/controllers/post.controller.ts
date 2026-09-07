import type { Request, Response } from "express";

import type { CreatePostUseCase } from "../../../application/use-cases/posts/create-post.use-case";
import type { DeletePostUseCase } from "../../../application/use-cases/posts/delete-post.use-case";
import type { GetPostUseCase } from "../../../application/use-cases/posts/get-post.use-case";
import type { ListPostsUseCase } from "../../../application/use-cases/posts/list-posts.use-case";
import type { UpdatePostUseCase } from "../../../application/use-cases/posts/update-post.use-case";
import type { Post } from "../../../domain/entities/post.entity";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";
import {
  createPostSchema,
  postIdParamsSchema,
  postSlugParamsSchema,
  updatePostSchema,
} from "../validators/post.validator";

export class PostController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly listPostsUseCase: ListPostsUseCase,
    private readonly getPostUseCase: GetPostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
  ) {}

  create = async (request: Request, response: Response): Promise<void> => {
    const input = createPostSchema.parse(request.body);
    const authorId = this.getAuthenticatedUserId(request);
    const post = await this.createPostUseCase.execute(input, authorId);

    response.status(201).json({
      status: "success",
      data: {
        post: this.toResponsePost(post),
      },
    });
  };

  list = async (_request: Request, response: Response): Promise<void> => {
    const posts = await this.listPostsUseCase.execute();

    response.status(200).json({
      status: "success",
      data: {
        posts: posts.map((post) => this.toResponsePost(post)),
      },
    });
  };

  getBySlug = async (request: Request, response: Response): Promise<void> => {
    const { slug } = postSlugParamsSchema.parse(request.params);
    const post = await this.getPostUseCase.execute(slug);

    response.status(200).json({
      status: "success",
      data: {
        post: this.toResponsePost(post),
      },
    });
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const { id } = postIdParamsSchema.parse(request.params);
    const input = updatePostSchema.parse(request.body);
    const authorId = this.getAuthenticatedUserId(request);
    const post = await this.updatePostUseCase.execute(id, input, authorId);

    response.status(200).json({
      status: "success",
      data: {
        post: this.toResponsePost(post),
      },
    });
  };

  delete = async (request: Request, response: Response): Promise<void> => {
    const { id } = postIdParamsSchema.parse(request.params);
    const authorId = this.getAuthenticatedUserId(request);

    await this.deletePostUseCase.execute(id, authorId);

    response.status(204).send();
  };

  private getAuthenticatedUserId(request: Request): string {
    if (!request.user) {
      throw new AppError(
        "Se requiere un usuario autenticado",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    return request.user.id;
  }

  private toResponsePost(post: Post) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      authorId: post.authorId,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
