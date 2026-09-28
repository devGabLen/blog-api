import { describe, it, expect } from "vitest";
import request from "supertest";

import { app } from "../../src/app";

describe("Auth Integration Tests", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: uniqueEmail,
          password: "password123",
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(uniqueEmail);
      expect(response.body.data.user.name).toBe("Test User");
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it("should return 409 when email already exists", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Another User",
          email: "test@example.com",
          password: "password456",
        });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe("error");
    });

    it("should return 422 with invalid data", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "T",
          email: "invalid-email",
          password: "short",
        });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    it("should return 401 with invalid credentials", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("error");
    });

    it("should return 401 when user does not exist", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("error");
    });
  });
});
