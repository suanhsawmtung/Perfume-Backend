import { NextFunction, Request, Response } from "express";
import { errorCode } from "../config/error-code";
import { hasCache } from "../utils/cache";
import { createError } from "../utils/common";

// const whiteLists = ["127.0.0.1"];

export const isMaintenanceMode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const ip: any = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  // if (whiteLists.includes(ip)) return next();

  if (hasCache(".maintenance")) {
    const error = createError({
      message:
        "This app is currently under maintenance. Please try again later.",
      status: 503,
      code: errorCode.maintenance,
    });

    return next(error);
  }

  next();
};
