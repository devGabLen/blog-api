import type { Post } from '../../../domain/entities/post.entity';
import type { PostRepository } from '../../../domain/repositories/post.repository';
import { AppError } from '../../../shared/errors/app-error';
import { HTTP_STATUS } from '../../../shared/errors/error-codes';

export class GetPostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(slug: string): Promise<Post> {
    const post = await this.postRepository.findBySlug(slug);

    if (!post || post.status !== 'published') {
      throw new AppError(
        'Publicación no encontrada',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return post;
  }
}