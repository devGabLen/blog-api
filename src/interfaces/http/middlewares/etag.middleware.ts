import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function etagMiddleware(request: Request, response: Response, next: NextFunction): void {
  const originalJson = response.json.bind(response);

  response.json = (body: unknown): Response => {
    const bodyString = JSON.stringify(body);
    const etag = crypto.createHash("md5").update(bodyString).digest("hex");

    response.setHeader("ETag", `"${etag}"`);

    const ifNoneMatch = request.headers["if-none-match"];
    if (ifNoneMatch === `"${etag}"`) {
      return response.status(304).end();
    }

    return originalJson(body);
  };

  next();
}
