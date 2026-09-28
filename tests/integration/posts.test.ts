import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

import { app } from "../../src/app";
import { createUser, loginUser, createPost } from "./helpers";

describe("Posts Integration Tests", () => {
  let token: string;

  beforeAll(async () => {
    await createUser(app, {
      name: "Post Author",
      email: "author@example.com",
      password: "password123",
    });
    token = await loginUser(app, {
      email: "author@example.com",
      password: "password123",
    });
  });

  describe("POST /api/posts", () => {
    it("should create a new post", async () => {
      const uniqueTitle = `Test Post ${Date.now()}`;
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: uniqueTitle,
          content: "This is a test post",
          status: "published",
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.post).toBeDefined();
      expect(response.body.data.post.title).toBe(uniqueTitle);
      expect(response.body.data.post.slug).toBe(uniqueTitle.toLowerCase().replace(/\s+/g, "-"));
      expect(response.body.data.post.status).toBe("published");
    });

    it("should return 401 without token", async () => {
      const response = await request(app)
        .post("/api/posts")
        .send({
          title: "Test Post",
          content: "This is a test post",
        });

      expect(response.status).toBe(401);
    });

    it("should return 422 with invalid data", async () => {
      const response = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "ab",
          content: "",
        });

      expect(response.status).toBe(422);
    });
  });

  describe("GET /api/posts", () => {
    it("should list published posts with pagination", async () => {
      await createPost(app, token, {
        title: "First Post",
        content: "Content 1",
        status: "published",
      });
      await createPost(app, token, {
        title: "Second Post",
        content: "Content 2",
        status: "published",
      });

      const response = await request(app).get("/api/posts");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.posts).toBeDefined();
      expect(response.body.data.posts.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(2);
    });

    it("should paginate results", async () => {
      for (let i = 0; i < 5; i++) {
        await createPost(app, token, {
          title: `Post ${i}`,
          content: `Content ${i}`,
          status: "published",
        });
      }

      const response = await request(app).get("/api/posts?page=1&limit=2");

      expect(response.status).toBe(200);
      expect(response.body.data.posts.length).toBe(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
      expect(response.body.data.pagination.hasNext).toBe(true);
    });
  });

  describe("GET /api/posts/:slug", () => {
    it("should get a post by slug", async () => {
      const post = await createPost(app, token, {
        title: "Unique Post Title",
        content: "Unique content",
        status: "published",
      });

      const response = await request(app).get(`/api/posts/${post.slug}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.post.title).toBe("Unique Post Title");
    });

    it("should return 404 for non-existent slug", async () => {
      const response = await request(app).get("/api/posts/non-existent-slug");

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/posts/:id", () => {
    it("should update a post", async () => {
      const post = await createPost(app, token, {
        title: "Original Title",
        content: "Original content",
        status: "draft",
      });

      const response = await request(app)
        .patch(`/api/posts/${post.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated Title" });

      expect(response.status).toBe(200);
      expect(response.body.data.post.title).toBe("Updated Title");
    });

    it("should return 403 when user is not the author", async () => {
      const post = await createPost(app, token, {
        title: "Protected Post",
        content: "Content",
        status: "published",
      });

      await createUser(app, {
        name: "Other User",
        email: "other@example.com",
        password: "password123",
      });
      const otherToken = await loginUser(app, {
        email: "other@example.com",
        password: "password123",
      });

      const response = await request(app)
        .patch(`/api/posts/${post.id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ title: "Hacked Title" });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /api/posts/:id", () => {
    it("should delete a post", async () => {
      const post = await createPost(app, token, {
        title: "Post to Delete",
        content: "Content",
        status: "draft",
      });

      const response = await request(app)
        .delete(`/api/posts/${post.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
    });

    it("should return 404 for non-existent post", async () => {
      const response = await request(app)
        .delete("/api/posts/550e8400-e29b-41d4-a716-446655440000")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
