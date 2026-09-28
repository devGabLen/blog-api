import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const uploadController = new UploadController();

export const uploadRouter = Router();

/**
 * @openapi
 * /upload:
 *   post:
 *     summary: Subir imagen
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *       400:
 *         description: No se proporcionó archivo
 *       401:
 *         description: No autenticado
 *       413:
 *         description: Archivo demasiado grande
 *       415:
 *         description: Tipo de archivo no permitido
 */
uploadRouter.post("/", authMiddleware, uploadController.uploadImage, uploadController.handleUpload);
