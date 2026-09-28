import type { Post } from "../../../domain/entities/post.entity";
import type { PostRepository } from "../../../domain/repositories/post.repository";
import type { PaginatedResult, SearchPostsParams } from "../../dtos/post.dto";

export class SearchPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(params: SearchPostsParams): Promise<PaginatedResult<Post>> {
    return this.postRepository.searchPublished(params);
  }
}
