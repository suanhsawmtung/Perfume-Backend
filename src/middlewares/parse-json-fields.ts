import { NextFunction, Response } from "express";
import { CustomRequest } from "../types/common";

export const parseJsonFields =
  (fields: string[]) =>
  (req: CustomRequest, res: Response, next: NextFunction) => {
    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === "string") {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (error) {
          next(error);
        }
      }
    }

    next();
  };