import type { NextFunction, Request, Response } from "express";

import { readCookie } from "../lib/cookies.js";
import { asRequestWithContext } from "../lib/require-selected-user.js";

const SESSION_COOKIE_NAME = "swapsphere_user_id";

export const sessionSelectionMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const request = asRequestWithContext(req);

  const headerUserId = req.header("x-user-id");
  const cookieUserId = readCookie(req.header("cookie"), SESSION_COOKIE_NAME);

  request.selectedUserId = headerUserId ?? cookieUserId;

  next();
};

export const setSelectedUserCookie = (res: Response, userId: string): void => {
  res.cookie(SESSION_COOKIE_NAME, userId, {
    maxAge: 1000 * 60 * 60 * 8,
    httpOnly: false,
    sameSite: "lax"
  });
};
