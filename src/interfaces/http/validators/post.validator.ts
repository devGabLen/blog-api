import { z } from "zod";

const postStatusSchema = z.enum(["draft", "published"]);

export const createPostSchema = z.object({
  title: z.string().trim().min(3).max(200),
  content: z.string().trim().min(1).max(50000),
  status: postStatusSchema.default("draft"),
});

export const updatePostSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    content: z.string().trim().min(1).max(50000).optional(),
    status: postStatusSchema.optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined ||
      data.status !== undefined,
    {
      message: "Debes enviar al menos un campo para actualizar",
      path: ["body"],
    },
  );

export const postIdParamsSchema = z.object({
  id: z.string().uuid(),
});
export const postSlugParamsSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
