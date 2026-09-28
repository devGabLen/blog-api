import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export const listCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const commentIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const postIdParamsSchema = z.object({
  postId: z.string().uuid(),
});
