import express from "express";

import { corsMiddleware, helmetMiddleware } from "./config/security";
import { setupSwagger } from "./config/swagger";
import { errorMiddleware } from "./interfaces/http/middlewares/error.middleware";
import { notFoundMiddleware } from "./interfaces/http/middlewares/not-found.middleware";
import { requestLogger } from "./interfaces/http/middlewares/request-logger.middleware";
import { etagMiddleware } from "./interfaces/http/middlewares/etag.middleware";
import { apiRouter } from "./interfaces/http/routes";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmetMiddleware);
app.use(corsMiddleware);

app.use(express.json({ limit: "10kb" }));

setupSwagger(app);

app.use(requestLogger);
app.use(etagMiddleware);

app.use("/api", apiRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);
