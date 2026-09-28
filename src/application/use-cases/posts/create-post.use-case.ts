import { randomUUID } from "node:crypto";

import type { CreatePostDto } from "../../dtos/post.dto";
import type { Post } from "../../../domain/entities/post.entity";
import type { PostRepository } from "../../../domain/repositories/post.repository";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";
import { sanitizeContent } from "../../../shared/utils/sanitize";
import { slugify } from "../../../shared/utils/slugify";

export class CreatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: CreatePostDto, authorId: string): Promise<Post> {
    const baseSlug = slugify(input.title).slice(0, 210);

    if (!baseSlug) {
      throw new AppError(
        "El título debe contener letras o números",
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const slug = await this.createUniqueSlug(baseSlug);
    const now = new Date();

    const post: Post = {
      id: randomUUID(),
      title: input.title.trim(),
      slug,
      content: sanitizeContent(input.content.trim()),
      imageUrl: input.imageUrl ?? null,
      authorId,
      status: input.status,
      publishedAt: input.status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    return this.postRepository.create(post);
  }

  private async createUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let suffix = 2;

    while (await this.postRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }
}
