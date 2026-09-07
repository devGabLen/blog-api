import type { Post } from "../entities/post.entity";

export interface PostRepository {
  create(post: Post): Promise<Post>;
  findPublished(): Promise<Post[]>;
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<Post | null>;
  update(post: Post): Promise<Post>;
  delete(id: string): Promise<void>;
}
