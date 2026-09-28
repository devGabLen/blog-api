import { describe, it, expect } from "vitest";

import {
  commentIdParamsSchema,
  createCommentSchema,
  postIdParamsSchema,
} from "../../../src/interfaces/http/validators/comment.validator";

describe("createCommentSchema", () => {
  it("should validate a valid comment input", () => {
    const input = {
      content: "Gran post!",
    };

    const result = createCommentSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should reject empty content", () => {
    const input = {
      content: "",
    };

    const result = createCommentSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject content longer than 5000 characters", () => {
    const input = {
      content: "a".repeat(5001),
    };

    const result = createCommentSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should trim content", () => {
    const input = {
      content: "  Gran post!  ",
    };

    const result = createCommentSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("Gran post!");
    }
  });
});

describe("commentIdParamsSchema", () => {
  it("should validate a valid UUID", () => {
    const input = {
      id: "550e8400-e29b-41d4-a716-446655440000",
    };

    const result = commentIdParamsSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID", () => {
    const input = {
      id: "invalid-uuid",
    };

    const result = commentIdParamsSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});

describe("postIdParamsSchema", () => {
  it("should validate a valid UUID", () => {
    const input = {
      postId: "550e8400-e29b-41d4-a716-446655440000",
    };

    const result = postIdParamsSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID", () => {
    const input = {
      postId: "invalid-uuid",
    };

    const result = postIdParamsSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});
