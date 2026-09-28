import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

import { app } from "../../src/app";
import { createUser, loginUser, createPost, createComment } from "./helpers";

describe("Comments Integration Tests", () => {
  let token: string;
  let postId: string;

  beforeAll(async () => {
    await createUser(app, {
      name: "Comment Author",
      email: "commenter@example.com",
      password: "password123",
    });
    token = await loginUser(app, {
      email: "commenter@example.com",
      password: "password123",
    });

    const post = await createPost(app, token, {
      title: "Post for Comments",
      content: "Content",
      status: "published",
    });
    postId = post.id;
  });

  describe("POST /api/comments/posts/:postId", () => {
    it("should create a comment", async () => {
      const response = await request(app)
        .post(`/api/comments/posts/${postId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Great post!" });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.comment).toBeDefined();
      expect(response.body.data.comment.content).toBe("Great post!");
    });

    it("should return 401 without token", async () => {
      const response = await request(app)
        .post(`/api/comments/posts/${postId}`)
        .send({ content: "Anonymous comment" });

      expect(response.status).toBe(401);
    });

    it("should return 404 for non-existent post", async () => {
      const response = await request(app)
        .post("/api/comments/posts/550e8400-e29b-41d4-a716-446655440000")
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Comment" });

      expect(response.status).toBe(404);
    });

    it("should sanitize HTML in comments", async () => {
      const response = await request(app)
        .post(`/api/comments/posts/${postId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "<script>alert('xss')</script>Safe comment" });

      expect(response.status).toBe(201);
      expect(response.body.data.comment.content).not.toContain("<script>");
    });
  });

  describe("GET /api/comments/posts/:postId", () => {
    it("should list comments for a post", async () => {
      await createComment(app, token, postId, "First comment");
      await createComment(app, token, postId, "Second comment");

      const response = await request(app).get(`/api/comments/posts/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.comments).toBeDefined();
      expect(response.body.data.comments.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it("should paginate comments", async () => {
      for (let i = 0; i < 5; i++) {
        await createComment(app, token, postId, `Comment ${i}`);
      }

      const response = await request(app).get(
        `/api/comments/posts/${postId}?page=1&limit=2`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.comments.length).toBe(2);
      expect(response.body.data.pagination.page).toBe(1);
    });
  });

  describe("DELETE /api/comments/:id", () => {
    it("should delete a comment", async () => {
      const comment = await createComment(app, token, postId, "To delete");

      const response = await request(app)
        .delete(`/api/comments/${comment.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
    });

    it("should return 403 when user is not the author", async () => {
      const comment = await createComment(app, token, postId, "Protected");

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
        .delete(`/api/comments/${comment.id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });
});
