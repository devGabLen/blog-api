import type { Post } from "../../../domain/entities/post.entity";
import type { PostRepository } from "../../../domain/repositories/post.repository";
import type { PaginatedResult, PaginationParams } from "../../dtos/post.dto";

export class ListPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(params?: PaginationParams): Promise<PaginatedResult<Post>> {
    return this.postRepository.findPublished(params);
  }
}
