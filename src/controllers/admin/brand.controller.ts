import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import { AdminBrandService } from "../../services/brand/admin.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const adminBrandService = new AdminBrandService();

export const listBrands = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminBrandService.listBrands(req.query);

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getBrand = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      
      throw error;
    }

    const result = await adminBrandService.getBrandDetail(slug);

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const createBrand = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    const result = await adminBrandService.createBrand({ name });

    return res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const updateBrand = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { name } = req.body;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      throw error;
    }

    const result = await adminBrandService.updateBrand(slug, {
      name,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const deleteBrand = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      throw error;
    }

    const result = await adminBrandService.deleteBrand(slug);

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
