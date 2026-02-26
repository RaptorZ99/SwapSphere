import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

import { asRequestWithContext } from "../lib/require-selected-user.js";

export const requestContextMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  asRequestWithContext(req).requestId = randomUUID();
  next();
};
