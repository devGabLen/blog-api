import type { PostStatus } from "../../domain/entities/post.entity";

export interface CreatePostDto {
  title: string;
  content: string;
  status: PostStatus;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  status?: PostStatus;
}
