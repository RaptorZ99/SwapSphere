import type { NextFunction, Request, Response } from "express";

import { asRequestWithContext } from "../lib/require-selected-user.js";

export const accessLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const request = asRequestWithContext(req);
  const start = performance.now();

  res.on("finish", () => {
    const elapsedMs = Math.round((performance.now() - start) * 100) / 100;

    console.info(
      JSON.stringify({
        requestId: request.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        elapsedMs
      })
    );
  });

  next();
};
