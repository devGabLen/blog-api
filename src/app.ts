import express from "express";

import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware";
import { notFoundMiddleware } from "./interfaces/http/middlewares/not-found.middleware";
import { apiRouter } from "./interfaces/http/routes";

export const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);
