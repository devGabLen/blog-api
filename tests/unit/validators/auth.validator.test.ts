import { describe, it, expect } from "vitest";

import {
  loginUserSchema,
  registerUserSchema,
} from "../../../src/interfaces/http/validators/auth.validator";

describe("registerUserSchema", () => {
  it("should validate a valid register input", () => {
    const input = {
      name: "Juan Pérez",
      email: "juan@example.com",
      password: "password123",
    };

    const result = registerUserSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should reject name shorter than 2 characters", () => {
    const input = {
      name: "J",
      email: "juan@example.com",
      password: "password123",
    };

    const result = registerUserSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject name longer than 100 characters", () => {
    const input = {
      name: "a".repeat(101),
      email: "juan@example.com",
      password: "password123",
    };

    const result = registerUserSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const input = {
      name: "Juan Pérez",
      email: "invalid-email",
      password: "password123",
    };

    const result = registerUserSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject password shorter than 8 characters", () => {
    const input = {
      name: "Juan Pérez",
      email: "juan@example.com",
      password: "short",
    };

    const result = registerUserSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject password longer than 72 characters", () => {
    const input = {
      name: "Juan Pérez",
      email: "juan@example.com",
      password: "a".repeat(73),
    };

    const result = registerUserSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should trim name and email", () => {
    const input = {
      name: "  Juan Pérez  ",
      email: "  juan@example.com  ",
      password: "password123",
    };

    const result = registerUserSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Juan Pérez");
      expect(result.data.email).toBe("juan@example.com");
    }
  });

  it("should convert email to lowercase", () => {
    const input = {
      name: "Juan Pérez",
      email: "JUAN@EXAMPLE.COM",
      password: "password123",
    };

    const result = registerUserSchema.safeParse(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("juan@example.com");
    }
  });
});

describe("loginUserSchema", () => {
  it("should validate a valid login input", () => {
    const input = {
      email: "juan@example.com",
      password: "password123",
    };

    const result = loginUserSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const input = {
      email: "invalid-email",
      password: "password123",
    };

    const result = loginUserSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject empty password", () => {
    const input = {
      email: "juan@example.com",
      password: "",
    };

    const result = loginUserSchema.safeParse(input);

    expect(result.success).toBe(false);
  });

  it("should reject password longer than 72 characters", () => {
    const input = {
      email: "juan@example.com",
      password: "a".repeat(73),
    };

    const result = loginUserSchema.safeParse(input);

    expect(result.success).toBe(false);
  });
});
