import { Router } from "express";

import { CreatePostUseCase } from "../../../application/use-cases/posts/create-post.use-case";
import { DeletePostUseCase } from "../../../application/use-cases/posts/delete-post.use-case";
import { GetPostUseCase } from "../../../application/use-cases/posts/get-post.use-case";
import { ListPostsUseCase } from "../../../application/use-cases/posts/list-posts.use-case";
import { UpdatePostUseCase } from "../../../application/use-cases/posts/update-post.use-case";
import { PostgresPostRepository } from "../../../infrastructure/database/repositories/postgres-post.repository";
import { PostController } from "../controllers/post.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const postRepository = new PostgresPostRepository();

const postController = new PostController(
  new CreatePostUseCase(postRepository),
  new ListPostsUseCase(postRepository),
  new GetPostUseCase(postRepository),
  new UpdatePostUseCase(postRepository),
  new DeletePostUseCase(postRepository),
);

export const postRouter = Router();

postRouter.get("/", postController.list);
postRouter.get("/:slug", postController.getBySlug);

postRouter.post("/", authMiddleware, postController.create);
postRouter.patch("/:id", authMiddleware, postController.update);
postRouter.delete("/:id", authMiddleware, postController.delete);
