import { Router } from "express";
import { database } from "../../../config/database";
import { logger } from "../../../config/logger";

import { authRouter } from "./auth.routes";
import { commentRouter } from "./comment.routes";
import { postRouter } from "./post.routes";
import { uploadRouter } from "./upload.routes";

export const apiRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Estado de la API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 */
apiRouter.get("/health", async (_request, response) => {
  try {
    await database.query("SELECT 1");
    response.status(200).json({
      status: "success",
      message: "Blog API funcionando correctamente",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ err: error }, "Health check failed");
    response.status(503).json({
      status: "error",
      message: "Servicio no disponible",
      timestamp: new Date().toISOString(),
    });
  }
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/posts", postRouter);
apiRouter.use("/comments", commentRouter);
apiRouter.use("/upload", uploadRouter);
