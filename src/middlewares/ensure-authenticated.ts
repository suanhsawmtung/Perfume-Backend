import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { errorCode } from "../../config/error-code";
import { generateJWT } from "../lib/unique-key-generator";
import { findUserByIdWithSensitive, updateUserRecord } from "../services/user/user.helpers";
import { CustomRequest } from "../types/common";
import { createError } from "../utils/common";

export const isAuthenticated = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
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

  const generateNewTokens = async () => {
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        env.jwt.refreshTokenSecret
      ) as { id: number; email: string };
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        const error = createError({
          message: "You are not an authenticated user.",
          status: 401,
          code: errorCode.unauthenticated,
        });

        return next(error);
      } else {
        const error = createError({
          message: "Refresh Token is invalid.",
          status: 400,
          code: errorCode.attack,
        });

        return next(error);
      }
    }

    if (isNaN(decoded.id)) {
      const error = createError({
        message: "This user does not exist.",
        status: 404,
        code: errorCode.authNotFound,
      });

      return next(error);
    }

    const user = await findUserByIdWithSensitive(decoded.id);

    if (!user) {
      const error = createError({
        message: "This user does not exist.",
        status: 404,
        code: errorCode.authNotFound,
      });

      return next(error);
    }

    if (user.email !== decoded.email) {
      const error = createError({
        message: "You are not an authenticated user.",
        status: 401,
        code: errorCode.unauthenticated,
      });

      return next(error);
    }

    if (
      (user.refreshToken !== refreshToken &&
        user.previousRefreshToken !== refreshToken) ||
      (user.previousRefreshToken === refreshToken &&
        Date.now() > user.updatedAt.getTime() + 30 * 1000)
    ) {
      const error = createError({
        message: "You are not an authenticated user.",
        status: 401,
        code: errorCode.retryAndLogout,
      });

      return next(error);
    }

    const newAccessToken = generateJWT({
      payload: { id: user.id },
      secret: env.jwt.accessTokenSecret,
      options: { expiresIn: 60 * 15 },
    });

    const newRefreshToken = generateJWT({
      payload: { id: user.id, email: user.email },
      secret: env.jwt.refreshTokenSecret,
      options: { expiresIn: "30d" },
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: env.appEnv === "production",
      sameSite: env.appEnv === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.appEnv === "production",
      sameSite: env.appEnv === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    await updateUserRecord(user.id, {
      refreshToken: newRefreshToken,
      previousRefreshToken: refreshToken,
    });

    req.userId = user.id;

    next();
  };

  if (!accessToken) {
    generateNewTokens();
  } else {
    try {
      const decoded = jwt.verify(
        accessToken,
        env.jwt.accessTokenSecret
      ) as { id: number };

      if (isNaN(decoded.id)) {
        const error = createError({
          message: "This user does not exist.",
          status: 404,
          code: errorCode.authNotFound,
        });

        return next(error);
      }

      req.userId = decoded.id;

      next();
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        generateNewTokens();
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
