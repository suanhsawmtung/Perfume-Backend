import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { AdminCategoryService } from "../../services/category/admin.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const adminCategoryService = new AdminCategoryService();

export const listCategories = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminCategoryService.listCategories(req.query);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getCategory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Slug is required",
        status: 400,
        code: errorCode.notFound,
      });
    }

    const result = await adminCategoryService.getCategoryDetail(slug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const createCategory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminCategoryService.createCategory(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const updateCategory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Slug is required",
        status: 400,
        code: errorCode.notFound,
      });
    }

    const result = await adminCategoryService.updateCategory(slug, req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const deleteCategory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Slug is required",
        status: 400,
        code: errorCode.notFound,
      });
    }

    const result = await adminCategoryService.deleteCategory(slug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
