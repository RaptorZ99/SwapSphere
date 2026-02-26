import type { Request } from "express";

import { AppError } from "./app-error.js";

export type RequestContext = {
  requestId?: string;
  selectedUserId?: string;
};

export type RequestWithContext = Request & RequestContext;

export const asRequestWithContext = (req: Request): RequestWithContext => {
  return req as RequestWithContext;
};

export const requireSelectedUserId = (req: Request): string => {
  const request = asRequestWithContext(req);

  if (!request.selectedUserId) {
    throw new AppError(401, "USER_NOT_SELECTED", "Aucun utilisateur selectionne");
  }

  return request.selectedUserId;
};
