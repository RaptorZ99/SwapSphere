import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/app-error.js";
import { asRequestWithContext } from "../lib/require-selected-user.js";
import type { ErrorResponse } from "../types/http.js";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  const request = asRequestWithContext(req);

  console.error(
    JSON.stringify({
      requestId: request.requestId,
      message: "Unhandled error",
      error
    })
  );

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected error"
    }
  });
};
