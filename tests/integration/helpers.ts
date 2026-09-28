import type { Express } from "express";
import request from "supertest";

export async function createUser(
  app: Express,
  userData: { name: string; email: string; password: string },
) {
  const response = await request(app)
    .post("/api/auth/register")
    .send(userData);

  if (response.status === 409) {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password });
    return loginResponse.body.data.user;
  }

  return response.body.data.user;
}

export async function loginUser(
  app: Express,
  credentials: { email: string; password: string },
) {
  const response = await request(app)
    .post("/api/auth/login")
    .send(credentials);

  return response.body.data.accessToken;
}

export async function createPost(
  app: Express,
  token: string,
  postData: { title: string; content: string; status?: "draft" | "published" },
) {
  const response = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${token}`)
    .send(postData);

  return response.body.data.post;
}

export async function createComment(
  app: Express,
  token: string,
  postId: string,
  content: string,
) {
  const response = await request(app)
    .post(`/api/comments/posts/${postId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ content });

  return response.body.data.comment;
}
