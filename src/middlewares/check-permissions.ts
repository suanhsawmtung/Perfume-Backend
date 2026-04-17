import { Role } from "@prisma/client";
import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { findUserById, findUserRoleById } from "../services/user/user.helpers";
import { CustomRequest } from "../types/common";
import { createError } from "../utils/common";

export const permit = (permissions: boolean, ...roles: Role[]) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      throw createError({
        message: "You are not an authenticated user.",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    const user = await findUserById(req.userId);

    if (!user) {
      const error = createError({
        message: "This user does not exist.",
        status: 404,
        code: errorCode.authNotFound,
      });

      return next(error);
    }

    const userRole = await findUserRoleById(req.userId);

    const result = userRole ? roles.includes(userRole) : false;

    const isAllowed = permissions && result;

    if (!isAllowed) {
      const error = createError({
        message: "This action is not allowed.",
        status: 403,
        code: errorCode.notAllowed,
      });

      return next(error);
    }

    next();
  };
};
