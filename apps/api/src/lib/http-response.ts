import type { Response } from "express";

import type { SuccessResponse } from "../types/http.js";

export const sendSuccess = <T>(res: Response, status: number, data: T, meta?: Record<string, unknown>): void => {
  const payload: SuccessResponse<T> = meta ? { data, meta } : { data };
  res.status(status).json(payload);
};
