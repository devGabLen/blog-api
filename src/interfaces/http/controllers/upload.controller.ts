import type { Request, Response } from "express";
import { upload, getImageUrl } from "../../../infrastructure/storage/upload.service";
import { AppError } from "../../../shared/errors/app-error";
import { HTTP_STATUS } from "../../../shared/errors/error-codes";

export class UploadController {
  uploadImage = upload.single("image");

  handleUpload = (request: Request, response: Response): void => {
    if (!request.file) {
      throw new AppError("No se proporcionó ningún archivo", HTTP_STATUS.BAD_REQUEST);
    }

    const imageUrl = getImageUrl(request.file.filename);

    response.status(201).json({
      status: "success",
      data: { imageUrl },
    });
  };
}
