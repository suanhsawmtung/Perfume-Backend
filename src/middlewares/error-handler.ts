import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { errorCode } from "../config/error-code";
import { CustomRequest } from "../types/common";
import { createError } from "../utils/common";
import { cleanupUploadedFiles } from "../utils/file-cleanup";
import { isAuthenticated } from "./ensure-authenticated";

export const handleValidationError = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const result = validationResult(req).array({ onlyFirstError: true });

  if (result.length > 0) {
    // Clean up uploaded files if validation fails
    await cleanupUploadedFiles(req as any);

    const error = createError({
      message: result[0]?.msg,
      status: 400,
      code: errorCode.invalid,
    });

    return next(error);
  } else {
    next();
  }
};

export const handleAuthCheckError = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Create a custom next function that intercepts errors
  const customNext = (err?: any) => {
    if (err) {
      // If authentication failed, return 200 with success: false
      return res.status(200).json({
        success: false,
        data: null,
        message: err.message || "You are not an authenticated user.",
      });
    }
    // If authentication succeeded, proceed to next middleware
    next();
  };

  // Call isAuthenticated with our custom next function
  isAuthenticated(req, res, customNext);
};
