import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { errorCode } from "../config/error-code";
import { findUserByIdWithSensitive } from "../services/user/user.helpers";
import { CustomRequest } from "../types/common";
import { createError } from "../utils/common";

export const ensureUnauthenticated = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.cookies || {};

  if (!refreshToken) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      env.jwt.refreshTokenSecret
    ) as { id: number; email: string };

    if (!isNaN(decoded.id)) {
      const user = await findUserByIdWithSensitive(decoded.id);

      if (
        user &&
        user.email === decoded.email &&
        user.refreshToken === refreshToken
      ) {
        const error = createError({
          message: "You are already logged in.",
          status: 403,
          code: errorCode.alreadyExists,
        });

        return next(error);
      }
    }
  } catch (err: any) {}

  next();
};