import { Router } from "express";

import { CreatePostUseCase } from "../../../application/use-cases/posts/create-post.use-case";
import { DeletePostUseCase } from "../../../application/use-cases/posts/delete-post.use-case";
import { GetPostUseCase } from "../../../application/use-cases/posts/get-post.use-case";
import { ListPostsUseCase } from "../../../application/use-cases/posts/list-posts.use-case";
import { SearchPostsUseCase } from "../../../application/use-cases/posts/search-posts.use-case";
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
  new SearchPostsUseCase(postRepository),
);

export const postRouter = Router();

/**
 * @openapi
 * /posts:
 *   get:
 *     summary: Listar posts publicados
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Lista de posts publicados
 */
postRouter.get("/", postController.list);

/**
 * @openapi
 * /posts/search:
 *   get:
 *     summary: Buscar posts por texto
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
postRouter.get("/search", postController.search);

/**
 * @openapi
 * /posts/{slug}:
 *   get:
 *     summary: Obtener post por slug
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post encontrado
 *       404:
 *         description: Post no encontrado
 */
postRouter.get("/:slug", postController.getBySlug);

/**
 * @openapi
 * /posts:
 *   post:
 *     summary: Crear nuevo post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 minLength: 1
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       201:
 *         description: Post creado exitosamente
 *       401:
 *         description: No autenticado
 *       422:
 *         description: Datos inválidos
 */
postRouter.post("/", authMiddleware, postController.create);

/**
 * @openapi
 * /posts/{id}:
 *   patch:
 *     summary: Actualizar post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       200:
 *         description: Post actualizado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Post no encontrado
 */
postRouter.patch("/:id", authMiddleware, postController.update);

/**
 * @openapi
 * /posts/{id}:
 *   delete:
 *     summary: Eliminar post
 *     tags: [Posts]
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
 *         description: Post eliminado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Post no encontrado
 */
postRouter.delete("/:id", authMiddleware, postController.delete);
