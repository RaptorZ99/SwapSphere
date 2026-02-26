import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

import { AppError } from "./app-error.js";

export type RequestValidationSchema = z.ZodObject<{
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}>;

export const validateRequest = <TSchema extends RequestValidationSchema>(schema: TSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      next(
        new AppError(400, "INVALID_INPUT", "Payload invalide", {
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        })
      );
      return;
    }

    res.locals.validated = result.data;
    next();
  };
};

export const getValidatedPayload = <T>(res: Response): T => {
  return res.locals.validated as T;
};
