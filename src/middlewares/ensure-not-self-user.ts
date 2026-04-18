import { NextFunction, Response } from "express";
import { errorCode } from "../config/error-code";
import { findUsernameByUserId } from "../services/user/user.helpers";
import { CustomRequest } from "../types/common";
import { createError } from "../utils/common";

export const ensureNotSelfUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { username } = req.params;

  if (!userId || !username) {
    return next();
  }

  const authenticatedUsername = await findUsernameByUserId(userId);

  const isSelf =
    authenticatedUsername && authenticatedUsername.trim() === username.trim();

  if (isSelf) {
    const error = createError({
      message: "This action is not allowed.",
      status: 403,
      code: errorCode.notAllowed,
    });
    return next(error);
  }

  return next();
};
