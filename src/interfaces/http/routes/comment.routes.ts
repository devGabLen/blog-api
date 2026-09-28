import { Router } from "express";

import { CreateCommentUseCase } from "../../../application/use-cases/comments/create-comment.use-case";
import { DeleteCommentUseCase } from "../../../application/use-cases/comments/delete-comment.use-case";
import { ListCommentsUseCase } from "../../../application/use-cases/comments/list-comments.use-case";
import { PostgresCommentRepository } from "../../../infrastructure/database/repositories/postgres-comment.repository";
import { PostgresPostRepository } from "../../../infrastructure/database/repositories/postgres-post.repository";
import { NotificationService } from "../../../infrastructure/notifications/notification.service";
import { CommentController } from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const commentRepository = new PostgresCommentRepository();
const postRepository = new PostgresPostRepository();
const notificationService = NotificationService.getInstance();
const commentController = new CommentController(
  new CreateCommentUseCase(commentRepository, postRepository, notificationService),
  new DeleteCommentUseCase(commentRepository),
  new ListCommentsUseCase(commentRepository),
);

export const commentRouter = Router();

/**
 * @openapi
 * /comments/posts/{postId}:
 *   get:
 *     summary: Listar comentarios de un post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de comentarios
 */
commentRouter.get("/posts/:postId", commentController.list);

/**
 * @openapi
 * /comments/posts/{postId}:
 *   post:
 *     summary: Crear comentario
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *     responses:
 *       201:
 *         description: Comentario creado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Post no encontrado
 */
commentRouter.post("/posts/:postId", authMiddleware, commentController.create);

/**
 * @openapi
 * /comments/{id}:
 *   delete:
 *     summary: Eliminar comentario
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Comentario eliminado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Comentario no encontrado
 */
commentRouter.delete("/:id", authMiddleware, commentController.delete);
