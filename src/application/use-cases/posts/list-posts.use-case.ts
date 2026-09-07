import type { Post } from '../../../domain/entities/post.entity';
import type { PostRepository } from '../../../domain/repositories/post.repository';

export class ListPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(): Promise<Post[]> {
    return this.postRepository.findPublished();
  }
}