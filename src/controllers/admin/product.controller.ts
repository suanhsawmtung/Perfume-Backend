import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import { AdminProductService } from "../../services/product/admin.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";
import { cleanupUploadedFiles } from "../../utils/file-cleanup";

const adminProductService = new AdminProductService();

export const listProducts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminProductService.listProducts(req.query);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminProductService.getProductDetail(slug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const listProductVariants = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminProductService.getProductDetail(slug); // Admin detail includes variants
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getProductVariant = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { variantSlug } = req.params;

    if (!variantSlug) {
      throw createError({
        message: "Variant slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminProductService.getVariantDetail(variantSlug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const createProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminProductService.createProduct(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const updateProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminProductService.updateProduct(slug, req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const deleteProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminProductService.deleteProduct(slug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const createProductVariant = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const imageFilenames =
      files && Array.isArray(files) ? files.map((file) => file.filename) : [];

    const result = await adminProductService.createVariant({
      ...req.body,
      ...(imageFilenames.length > 0 && { imageFilenames }),
    });

    return res.status(201).json(result);
  } catch (error: any) {
    await cleanupUploadedFiles(req);
    next(error);
  }
};

export const updateProductVariant = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { variantSlug } = req.params;

    if (!variantSlug) {
      throw createError({
        message: "Variant slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const files = (req as any).files as Express.Multer.File[] | undefined;
    const imageFilenames =
      files && Array.isArray(files) ? files.map((file) => file.filename) : [];

    const result = await adminProductService.updateVariant(variantSlug, {
      ...req.body,
      ...(imageFilenames.length > 0 && { imageFilenames }),
    });

    return res.status(200).json(result);
  } catch (error: any) {
    await cleanupUploadedFiles(req);
    next(error);
  }
};

export const deleteProductVariant = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { variantSlug } = req.params;

    if (!variantSlug) {
      throw createError({
        message: "Variant slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminProductService.deleteVariant(variantSlug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
