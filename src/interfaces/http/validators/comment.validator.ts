import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export const commentIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const postIdParamsSchema = z.object({
  postId: z.string().uuid(),
});
