import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import { parseProductQueryParams } from "../../services/product/product.helpers";
import * as ProductService from "../../services/product/product.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";
import { cleanupUploadedFiles } from "../../utils/file-cleanup";

export const listProducts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseProductQueryParams(req.query);

    // await prisma.image.createMany({
    //   data: [
    //     {
    //       path: "post-1.jpg",
    //       isPrimary: true,
    //       order: 0,
    //       productVariantId: 1,
    //     },
    //     {
    //       path: "post-2.jpg",
    //       isPrimary: false,
    //       order: 1,
    //       productVariantId: 1,
    //     },
    //     {
    //       path: "post-3.jpg",
    //       isPrimary: false,
    //       order: 2,
    //       productVariantId: 1,
    //     },
    //     {
    //       path: "post-4.jpg",
    //       isPrimary: false,
    //       order: 3,
    //       productVariantId: 1,
    //     },
    //     {
    //       path: "post-5.jpg",
    //       isPrimary: false,
    //       order: 4,
    //       productVariantId: 1,
    //     },
    //     {
    //       path: "post-6.jpg",
    //       isPrimary: false,
    //       order: 5,
    //       productVariantId: 1,
    //     },
    //   ],
    // });

    const {
      items: products,
      currentPage,
      totalPages,
      pageSize,
    } = await ProductService.listProducts(queryParams);

    res.status(200).json({
      success: true,
      data: {
        products,
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    });
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
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const product = await ProductService.getProductDetail(slug);

    res.status(200).json({
      success: true,
      data: { product },
      message: null,
    });
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
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const product = await ProductService.getProductVariants(slug);

    res.status(200).json({
      success: true,
      data: { product },
      message: null,
    });
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
    const { slug, variantSlug } = req.params;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    if (!variantSlug) {
      const error = createError({
        message: "Variant slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const variant = await ProductService.getProductVariantDetail(variantSlug);

    if (variant.product?.slug !== slug) {
      const error = createError({
        message: "Product variant does not belong to product.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: { variant },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

// export const createProductController = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const {
//       name,
//       description,
//       price,
//       discount,
//       inventory,
//       status,
//       materialId,
//       typeId,
//       brandId,
//     } = req.body;

//     const files = (req as any).files as Express.Multer.File[] | undefined;
//     const imageFilenames =
//       files && Array.isArray(files) ? files.map((file) => file.filename) : [];

//     const product = await validateAndCreateProduct({
//       name,
//       description,
//       price,
//       discount,
//       inventory,
//       status,
//       materialId,
//       typeId,
//       brandId,
//       ...(imageFilenames.length > 0 && { imageFilenames }),
//     });

//     (req as any).uploadedFiles = [];

//     res.status(201).json({
//       success: true,
//       data: { product },
//       message: "Product created successfully.",
//     });
//   } catch (error: any) {
//     await cleanupUploadedFiles(req);
//     next(error);
//   }
// };

export const createProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      concentration,
      gender,
      brandId,
      isActive,
      isLimited,
      releasedYear,
    } = req.body;

    const product = await ProductService.createProduct({
      name,
      description,
      concentration,
      gender,
      brandId,
      isActive,
      isLimited,
      releasedYear,
    });

    res.status(201).json({
      success: true,
      data: { product },
      message: "Product created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

// export const updateProductController = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { slug } = req.params;
//
//     if (!slug) {
//       const error = createError({
//         message: "Slug parameter is required.",
//         status: 400,
//         code: errorCode.invalid,
//       });
//       await cleanupUploadedFiles(req);
//       return next(error);
//     }
//
//     const {
//       name,
//       description,
//       price,
//       discount,
//       inventory,
//       status,
//       materialId,
//       typeId,
//       brandId,
//       imageIds,
//     } = req.body;
//
//     const files = (req as any).files as Express.Multer.File[] | undefined;
//     const imageFilenames =
//       files && Array.isArray(files) ? files.map((file) => file.filename) : [];
//
//     const product = await validateAndUpdateProduct(slug, {
//       name,
//       description,
//       price,
//       discount,
//       inventory,
//       status,
//       materialId,
//       typeId,
//       brandId,
//       ...(imageFilenames.length > 0 && { imageFilenames }),
//       ...(imageIds && { imageIds }),
//     });
//
//     (req as any).uploadedFiles = [];
//
//     res.status(200).json({
//       success: true,
//       data: { product },
//       message: "Product updated successfully.",
//     });
//   } catch (error: any) {
//     await cleanupUploadedFiles(req);
//     next(error);
//   }
// };

export const updateProduct = async (
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
      return next(error);
    }

    const {
      name,
      description,
      concentration,
      gender,
      brandId,
      isActive,
      isLimited,
      releasedYear,
    } = req.body;

    const product = await ProductService.updateProduct(slug, {
      name,
      description,
      concentration,
      gender,
      brandId,
      isActive,
      isLimited,
      releasedYear,
    });

    res.status(200).json({
      success: true,
      data: { product },
      message: "Product updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

// export const deleteProductController = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { slug } = req.params;
//
//     if (!slug) {
//       const error = createError({
//         message: "Slug parameter is required.",
//         status: 400,
//         code: errorCode.invalid,
//       });
//       return next(error);
//     }
//
//     await validateAndDeleteProduct(slug);
//
//     res.status(200).json({
//       success: true,
//       data: null,
//       message: "Product deleted successfully.",
//     });
//   } catch (error: any) {
//     next(error);
//   }
// };

export const deleteProduct = async (
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
      return next(error);
    }

    await ProductService.deleteProduct(slug);

    res.status(200).json({
      success: true,
      data: null,
      message: "Product deleted successfully.",
    });
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
    const { slug } = req.params;
    const {
      productId,
      size,
      source,
      price,
      discount,
      stock,
      isPrimary,
      isActive,
    } = req.body;
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const imageFilenames =
      files && Array.isArray(files) ? files.map((file) => file.filename) : [];

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      await cleanupUploadedFiles(req);
      return next(error);
    }

    const variant = await ProductService.createProductVariant(slug, {
      productId,
      size,
      source,
      price,
      discount,
      stock,
      isPrimary,
      isActive,
      ...(imageFilenames.length > 0 && { imageFilenames }),
    });

    (req as any).uploadedFiles = [];

    res.status(201).json({
      success: true,
      data: { variant },
      message: "Product variant created successfully.",
    });
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
    const { slug, variantSlug } = req.params;
    const {
      productId,
      size,
      source,
      price,
      discount,
      stock,
      isPrimary,
      isActive,
      existingImages,
      imageLayout,
    } = req.body;
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const imageFilenames =
      files && Array.isArray(files) ? files.map((file) => file.filename) : [];

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      await cleanupUploadedFiles(req);
      return next(error);
    }

    if (!variantSlug) {
      const error = createError({
        message: "Variant slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      await cleanupUploadedFiles(req);
      return next(error);
    }

    const variant = await ProductService.updateProductVariant(
      slug,
      variantSlug,
      {
        productId,
        size,
        source,
        price,
        discount,
        stock,
        isPrimary,
        isActive,
        existingImages,
        imageLayout,
        ...(imageFilenames.length > 0 && { imageFilenames }),
      }
    );

    (req as any).uploadedFiles = [];

    res.status(200).json({
      success: true,
      data: { variant },
      message: "Product variant updated successfully.",
    });
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
    const { slug, variantSlug } = req.params;

    if (!slug) {
      const error = createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    if (!variantSlug) {
      const error = createError({
        message: "Variant slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    await ProductService.deleteProductVariant(slug, variantSlug);

    res.status(200).json({
      success: true,
      data: null,
      message: "Product variant deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
