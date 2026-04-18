import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { errorCode } from "../config/error-code";
import { AuthService } from "../services/auth/auth.service";
import { findUserByIdWithSensitive } from "../services/user/user.helpers";
import { CustomRequest } from "../types/common";
import { createError } from "../utils/common";

const authService = new AuthService();

const refreshTokenAndNext = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
  refreshToken: string
) => {
  try {
    const { data } = await authService.refreshTokens({ refreshToken });
    
    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: env.appEnv === "production",
      sameSite: env.appEnv === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: env.appEnv === "production",
      sameSite: env.appEnv === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    req.userId = data.userData.id;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const isAuthenticated = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // const platform = req.headers["x-platform"];
    // if (platform === "mobile") {
    //   const accessTokenMobile = req.headers.authorization?.split(" ")[1];
    //   console.log(accessTokenMobile);
    // }

    const { accessToken, refreshToken } = req.cookies || {};

    if (!refreshToken) {
      const error = createError({
        message: "You are not an authenticated user.",
        status: 401,
        code: errorCode.unauthenticated,
      });

      return next(error);
    }

    if (!accessToken) {
      return await refreshTokenAndNext(req, res, next, refreshToken);
    } else {
      try {
        const decoded = jwt.verify(
          accessToken,
          env.jwt.accessTokenSecret
        ) as { id: number };

        if (!decoded.id || isNaN(decoded.id)) {
          const error = createError({
            message: "This user does not exist.",
            status: 404,
            code: errorCode.authNotFound,
          });

          return next(error);
        }

        req.userId = decoded.id;

        return next();
      } catch (err: any) {
        if (err.name === "TokenExpiredError") {
          return await refreshTokenAndNext(req, res, next, refreshToken);
        } else {
          const error = createError({
            message: "Access Token is invalid.",
            status: 400,
            code: errorCode.attack,
          });

          return next(error);
        }
      }
    }
  } catch (error) {
    return next(error);
  }
};

export const ensureUnauthenticated = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.cookies || {};

  // If no refresh token, user is not authenticated, proceed
  if (!refreshToken) {
    return next();
  }

  // If refresh token exists, verify it
  try {
    const decoded = jwt.verify(
      refreshToken,
      env.jwt.refreshTokenSecret
    ) as { id: number; email: string };

    if (!isNaN(decoded.id)) {
      const user = await findUserByIdWithSensitive(decoded.id);

      // If user exists and token matches, user is authenticated
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
  } catch (err: any) {
    // If token is invalid or expired, user is not authenticated, proceed
    // This is expected for unauthenticated users
  }

  // User is not authenticated, proceed
  next();
};
