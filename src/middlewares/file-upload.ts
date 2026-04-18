import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback, MulterError, StorageEngine } from "multer";
import path from "path";
import { errorCode } from "../config/error-code";
import { createError } from "../utils/common";
import { ensureDir } from "../utils/file";
import { trackUploadedFile } from "../utils/file-cleanup";

const whiteList = ["image/jpg", "image/jpeg", "image/png"];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (whiteList.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg and .png files are allowed"));
  }
};

const createStorage = (subDir: string): StorageEngine => {
  const uploadDir = path.join(process.cwd(), "uploads", "images", subDir);
  return multer.diskStorage({
    destination: async (_req, _file, cb) => {
      await ensureDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: function (_req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      // Get original extension
      const ext = path.extname(file.originalname);
      // Use only uniqueSuffix with original extension
      cb(null, uniqueSuffix + ext);
    },
  });
};

const createUpload = (subDir: string) => {
  return multer({
    storage: createStorage(subDir),
    fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
  });
};

// Create multer middleware with error handling (single file)
const createMulterMiddleware = (
  upload: ReturnType<typeof createUpload>,
  fieldName: string,
  subDir: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const middleware = upload.single(fieldName);
    middleware(req, res, (err: any) => {
      if (err) {
        // Store error in request for handleMulterError to process
        (req as any).multerError = err;
      } else {
        // Track uploaded file for cleanup if errors occur later
        const file = (req as any).file as Express.Multer.File;
        if (file) {
          trackUploadedFile(req, file.filename, subDir);
        } else {
          console.log("uploadPostImage file: none");
        }
      }
      next();
    });
  };
};

// Create multer middleware for multiple files
const createMulterArrayMiddleware = (
  upload: ReturnType<typeof createUpload>,
  fieldName: string,
  maxCount: number,
  subDir: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const middleware = upload.array(fieldName, maxCount);
    middleware(req, res, (err: any) => {
      if (err) {
        // Store error in request for handleMulterError to process
        (req as any).multerError = err;
      } else {
        // Track uploaded files for cleanup if errors occur later
        const files = (req as any).files as Express.Multer.File[];
        if (files && Array.isArray(files)) {
          files.forEach((file) => {
            trackUploadedFile(req, file.filename, subDir);
          });
        }
      }
      next();
    });
  };
};

// Generic error handler for multer errors
export const handleMulterError = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const err = (req as any).multerError;
  if (err) {
    if (err instanceof MulterError) {
      let message = "File upload error.";
      if (err.code === "LIMIT_FILE_SIZE") {
        message = "File size exceeds the maximum limit of 5MB.";
      } else if (err.code === "LIMIT_FILE_COUNT") {
        message = "Too many files. Maximum 4 files allowed.";
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        message = "Unexpected file field.";
      }
      const error = createError({
        message,
        status: 400,
        code: errorCode.invalid,
      });

      return next(error);
    }
    // File filter error or other errors
    const error = createError({
      message: err.message || "File upload error.",
      status: 400,
      code: errorCode.invalid,
    });

    return next(error);
  }
  next();
};

// Export multer middlewares
export const uploadPostImage = createMulterMiddleware(
  createUpload("post"),
  "image",
  "post"
);

export const uploadProfileImage = createMulterMiddleware(
  createUpload("user"),
  "avatar",
  "user"
);

// Product image upload middleware (multiple files, max 4)
export const uploadProductImages = createMulterArrayMiddleware(
  createUpload("product"),
  "images",
  4,
  "product"
);

export const uploadOrderImage = createMulterMiddleware(
  createUpload("order"),
  "image",
  "order"
);

// Default export for backward compatibility (profile images)
const upload = createMulterMiddleware(createUpload(""), "avatar", "");

export default upload;
