import { Router } from "express";

import { authRouter } from "./auth.routes";
import { commentRouter } from "./comment.routes";
import { postRouter } from "./post.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.status(200).json({
    status: "success",
    message: "Blog API funcionando correctamente",
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/posts", postRouter);
apiRouter.use("/comments", commentRouter);
