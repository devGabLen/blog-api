import { describe, it, expect } from "vitest";

import {
  createPostSchema,
  postIdParamsSchema,
  postSlugParamsSchema,
  updatePostSchema,
} from "../../../src/interfaces/http/validators/post.validator";

describe("createPostSchema", () => {
  it("should validate a valid create post input", () => {
    const input = {
      title: "Mi primer post",
      content: "Contenido del post",
      status: "draft" as const,
    };

    const result = createPostSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should default status to draft", () => {
    const input = {
      title: "Mi primer post",
      content: "Contenido del post",
    };

    const result = createPostSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("draft");
    }
  });

  it("should reject title shorter than 3 characters", () => {
    const input = {
      title: "ab",
      content: "Contenido del post",
    };

    const result = createPostSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject title longer than 200 characters", () => {
    const input = {
      title: "a".repeat(201),
      content: "Contenido del post",
    };

    const result = createPostSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject empty content", () => {
    const input = {
      title: "Mi primer post",
      content: "",
    };

    const result = createPostSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject invalid status", () => {
    const input = {
      title: "Mi primer post",
      content: "Contenido del post",
      status: "invalid",
    };

    const result = createPostSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});

describe("updatePostSchema", () => {
  it("should validate a valid update post input", () => {
    const input = {
      title: "Nuevo título",
    };

    const result = updatePostSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should validate partial update", () => {
    const input = {
      content: "Nuevo contenido",
    };

    const result = updatePostSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should reject empty update", () => {
    const input = {};

    const result = updatePostSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject title shorter than 3 characters", () => {
    const input = {
      title: "ab",
    };

    const result = updatePostSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject invalid status", () => {
    const input = {
      status: "invalid",
    };

    const result = updatePostSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});

describe("postIdParamsSchema", () => {
  it("should validate a valid UUID", () => {
    const input = {
      id: "550e8400-e29b-41d4-a716-446655440000",
    };

    const result = postIdParamsSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID", () => {
    const input = {
      id: "invalid-uuid",
    };

    const result = postIdParamsSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});

describe("postSlugParamsSchema", () => {
  it("should validate a valid slug", () => {
    const input = {
      slug: "mi-primer-post",
    };

    const result = postSlugParamsSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should reject slug with uppercase", () => {
    const input = {
      slug: "Mi-Post",
    };

    const result = postSlugParamsSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject slug with special characters", () => {
    const input = {
      slug: "mi_post!",
    };

    const result = postSlugParamsSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});
