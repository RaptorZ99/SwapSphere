import type { Request, Response } from "express";

import type { ErrorResponse } from "../types/http.js";

export const notFoundHandler = (_req: Request, res: Response<ErrorResponse>): void => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route introuvable"
    }
  });
};
