import { Router } from "express";

import { CreateCommentUseCase } from "../../../application/use-cases/comments/create-comment.use-case";
import { DeleteCommentUseCase } from "../../../application/use-cases/comments/delete-comment.use-case";
import { ListCommentsUseCase } from "../../../application/use-cases/comments/list-comments.use-case";
import { PostgresCommentRepository } from "../../../infrastructure/database/repositories/postgres-comment.repository";
import { CommentController } from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const commentRepository = new PostgresCommentRepository();
const commentController = new CommentController(
  new CreateCommentUseCase(commentRepository),
  new DeleteCommentUseCase(commentRepository),
  new ListCommentsUseCase(commentRepository),
);

export const commentRouter = Router();

commentRouter.get("/posts/:postId", commentController.list);
commentRouter.post("/posts/:postId", authMiddleware, commentController.create);
commentRouter.delete("/:id", authMiddleware, commentController.delete);
