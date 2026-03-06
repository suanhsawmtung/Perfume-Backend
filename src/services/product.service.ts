import {
  Concentration,
  Gender,
  Prisma
} from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../lib/prisma";
import {
  CreateProductParams,
  ListProductsParams,
  ParseProductQueryParamsResult,
  UpdateProductNewParams
} from "../types/product";
import { createError, createSlug, ensureUniqueSlug } from "../utils/common";
import { findBrandById } from "./brand/brand.helpers";
import { findProductDetail } from "./product/product.helpers";

export const getAllProducts = async ({
  pageSize,
  offset,
  search,
  brandSlug,
  gender,
  concentration,
  isActive,
  isLimited,
}: ListProductsParams) => {
  const whereConditions: Prisma.ProductWhereInput[] = [];

  if (search) {
    whereConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (brandSlug) {
    whereConditions.push({
      brand: {
        slug: brandSlug,
      },
    });
  }

  if (gender) {
    whereConditions.push({ gender });
  }

  if (concentration) {
    whereConditions.push({ concentration });
  }

  if (typeof isActive === "boolean") {
    whereConditions.push({ isActive });
  }

  if (typeof isLimited === "boolean") {
    whereConditions.push({ isLimited });
  }

  const where: Prisma.ProductWhereInput =
    whereConditions.length > 0
      ? {
          AND: whereConditions,
        }
      : {};

  // Get total count for pagination
  const total = await prisma.product.count({ where });

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Calculate current page (0-based offset to 1-based page)
  const currentPage = Math.floor(offset / pageSize) + 1;

  // Fetch products with offset pagination
  const items = await prisma.product.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { id: "desc" },
    select: {
      name: true,
      slug: true,
      concentration: true,
      gender: true,
      rating: true,
      isActive: true,
      brand: {
        select: { name: true },
      },
      _count: {
        select: {
          variants: true,
        },
      },
    },
  });

  return {
    items,
    currentPage,
    totalPages,
    pageSize,
  };
};

export const getProductBySlug = async (slug: string) => {
  return await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      variants: {
        include: {
          inventories: true,
          images: {
            select: {
              path: true,
              isPrimary: true,
              order: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      },
      _count: {
        select: {
          wishlists: true,
          ratings: true,
          // orders: true,
          variants: true,
        },
      },
    },
  });
};

export const getProductById = async (id: number) => {
  return await prisma.product.findUnique({
    where: { id },
  });
};

export const getProductByName = async (name: string) => {
  return await prisma.product.findFirst({
    where: { name },
  });
};

export const getProductByNameExcludingId = async (
  name: string,
  excludeId: number
) => {
  return await prisma.product.findFirst({
    where: {
      name,
      NOT: { id: excludeId },
    },
  });
};

// export const createProduct = async (
//   createProductData: Prisma.ProductCreateInput
// ) => {
//   return await prisma.product.create({
//     data: createProductData,
//     include: {
//       material: true,
//       type: true,
//       brand: true,
//       images: true,
//     },
//   });
// };

// export const updateProduct = async (
//   id: number,
//   updateProductData: Prisma.ProductUpdateInput
// ) => {
//   return await prisma.product.update({
//     where: { id },
//     data: updateProductData,
//     include: {
//       material: true,
//       type: true,
//       images: true,
//     },
//   });
// };

export const deleteProduct = async (id: number) => {
  return await prisma.product.delete({
    where: { id },
  });
};

// export const getProductImages = async (productId: number) => {
//   return await prisma.image.findMany({
//     where: { productId },
//   });
// };

// export const createProductImage = async (productId: number, path: string) => {
//   return await prisma.image.create({
//     data: {
//       path,
//       productId,
//     },
//   });
// };

export const deleteProductImage = async (id: number) => {
  return await prisma.image.delete({
    where: { id },
  });
};

// export const deleteProductImages = async (productId: number) => {
//   return await prisma.image.deleteMany({
//     where: { productId },
//   });
// };

export const updateProductImage = async (id: number, path: string) => {
  return await prisma.image.update({
    where: { id },
    data: { path },
  });
};

export const getProductImageById = async (id: number) => {
  return await prisma.image.findUnique({
    where: { id },
  });
};

// Validation and checking functions that call simple service functions

export const validateAndGetProductBySlug = async (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const product = await findProductDetail(slug);

  if (!product) {
    throw createError({
      message: "Product not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return product;
};

// export const validateAndCreateProduct = async (params: CreateProductParams) => {
//   const {
//     name,
//     description,
//     price,
//     discount,
//     inventory,
//     status,
//     materialId,
//     typeId,
//     brandId,
//     imageFilenames,
//   } = params;

//   const trimmedName = name.trim();

//   const existingByName = await getProductByName(trimmedName);

//   if (existingByName) {
//     throw createError({
//       message: "Product with this name already exists.",
//       status: 409,
//       code: errorCode.alreadyExists,
//     });
//   }

//   const materialIdNum = parseInt(String(materialId), 10);
//   if (isNaN(materialIdNum) || materialIdNum <= 0) {
//     throw createError({
//       message: "Invalid material ID.",
//       status: 400,
//       code: errorCode.invalid,
//     });
//   }

//   const material = await getMaterialById(materialIdNum);
//   if (!material) {
//     throw createError({
//       message: "Material not found.",
//       status: 404,
//       code: errorCode.notFound,
//     });
//   }

//   const typeIdNum = parseInt(String(typeId), 10);
//   if (isNaN(typeIdNum) || typeIdNum <= 0) {
//     throw createError({
//       message: "Invalid type ID.",
//       status: 400,
//       code: errorCode.invalid,
//     });
//   }

//   const type = await getTypeById(typeIdNum);
//   if (!type) {
//     throw createError({
//       message: "Type not found.",
//       status: 404,
//       code: errorCode.notFound,
//     });
//   }

//   const brandIdNum = parseInt(String(brandId), 10);
//   if (isNaN(brandIdNum) || brandIdNum <= 0) {
//     throw createError({
//       message: "Invalid brand ID.",
//       status: 400,
//       code: errorCode.invalid,
//     });
//   }
  
//   const brand = await findBrandById(brandIdNum);
//   if (!brand) {
//     throw createError({
//       message: "Brand not found.",
//       status: 404,
//       code: errorCode.notFound,
//     });
//   }

//   const baseSlug = createSlug(trimmedName);
//   const slugOwner = await getProductBySlug(baseSlug);
//   const slugExists = !!slugOwner;
//   const slug = await ensureUniqueSlug(baseSlug, slugExists);

//   const product = await createProduct({
//     name: trimmedName,
//     slug,
//     description: description.trim(),
//     price: parseFloat(String(price)),
//     discount: discount ? parseFloat(String(discount)) : 0,
//     inventory: inventory ? parseInt(String(inventory), 10) : 0,
//     status: status || Status.ACTIVE,
//     material: {
//       connect: { id: material.id },
//     },
//     type: {
//       connect: { id: type.id },
//     },
//     brand: {
//       connect: { id: brand.id },
//     },
//   });

//   if (imageFilenames && imageFilenames.length > 0) {
//     for (const imageFilename of imageFilenames) {
//       await createProductImage(product.id, imageFilename);
//     }
//   }

//   const productWithImages = await getProductBySlug(slug);

//   return productWithImages;
// };

export const validateAndCreateProduct = async (params: CreateProductParams) => {
  const {
    name,
    description,
    concentration,
    gender,
    brandId,
    isActive,
    isLimited,
    releasedYear,
  } = params;

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();

  if (!trimmedName) {
    throw createError({
      message: "Name is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (!trimmedDescription) {
    throw createError({
      message: "Description is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (!concentration) {
    throw createError({
      message: "Concentration is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (!gender) {
    throw createError({
      message: "Gender is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existingByName = await getProductByName(trimmedName);
  if (existingByName) {
    throw createError({
      message: "Product with this name already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const brandIdNum = parseInt(String(brandId), 10);
  if (isNaN(brandIdNum) || brandIdNum <= 0) {
    throw createError({
      message: "Invalid brand ID.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const brand = await findBrandById(brandIdNum);
  if (!brand) {
    throw createError({
      message: "Brand not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const baseSlug = createSlug(trimmedName);
  const slugOwner = await getProductBySlug(baseSlug);
  const slugExists = !!slugOwner;
  const slug = await ensureUniqueSlug(baseSlug, slugExists);

  const parsedReleasedYear =
    releasedYear !== undefined ? Number(releasedYear) : null;

  const product = await prisma.product.create({
    data: {
      name: trimmedName,
      slug,
      concentration,
      gender,
      description: trimmedDescription,
      isActive: typeof isActive === "boolean" ? isActive : true,
      isLimited: typeof isLimited === "boolean" ? isLimited : false,
      releasedYear:
        parsedReleasedYear !== null && !isNaN(parsedReleasedYear)
          ? parsedReleasedYear
          : null,
      brand: {
        connect: { id: brand.id },
      },
    },
    include: {
      brand: true,
    },
  });

  return product;
};

// export const validateAndUpdateProduct = async (
//   slug: string,
//   params: UpdateProductParams
// ) => {
//   const {
//     name,
//     description,
//     price,
//     discount,
//     inventory,
//     status,
//     materialId,
//     typeId,
//     brandId,
//     imageFilenames,
//     imageIds,
//   } = params;
//
//   if (!slug || slug.trim().length === 0) {
//     throw createError({
//       message: "Slug parameter is required.",
//       status: 400,
//       code: errorCode.invalid,
//     });
//   }
//
//   const existing = await getProductBySlug(slug);
//   if (!existing) {
//     throw createError({
//       message: "Product not found.",
//       status: 404,
//       code: errorCode.notFound,
//     });
//   }
//
//   const trimmedName = name.trim();
//
//   const existingByName = await getProductByNameExcludingId(
//     trimmedName,
//     existing.id
//   );
//   if (existingByName) {
//     throw createError({
//       message: "Product with this name already exists.",
//       status: 409,
//       code: errorCode.alreadyExists,
//     });
//   }
//
//   const materialIdNum = parseInt(String(materialId), 10);
//   if (isNaN(materialIdNum) || materialIdNum <= 0) {
//     throw createError({
//       message: "Invalid material ID.",
//       status: 400,
//       code: errorCode.invalid,
//     });
//   }
//
//   const material = await getMaterialById(materialIdNum);
//   if (!material) {
//     throw createError({
//       message: "Material not found.",
//       status: 404,
//       code: errorCode.notFound,
//     });
//   }
//
//   const typeIdNum = parseInt(String(typeId), 10);
//   if (isNaN(typeIdNum) || typeIdNum <= 0) {
//     throw createError({
//       message: "Invalid type ID.",
//       status: 400,
//       code: errorCode.invalid,
//     });
//   }
//
//   const type = await getTypeById(typeIdNum);
//   if (!type) {
//     throw createError({
//       message: "Type not found.",
//       status: 404,
//       code: errorCode.notFound,
//     });
//   }
//
//   const brandIdNum = parseInt(String(brandId), 10);
//   if (isNaN(brandIdNum) || brandIdNum <= 0) {
//     throw createError({
//       message: "Invalid brand ID.",
//       status: 400,
//       code: errorCode.invalid,
//     });
//   }
//
//   const brand = await findBrandById(brandIdNum);
//   if (!brand) {
//     throw createError({
//       message: "Brand not found.",
//       status: 404,
//       code: errorCode.notFound,
//     });
//   }
//
//   const baseSlug = createSlug(trimmedName);
//   const slugOwner = await getProductBySlug(baseSlug);
//   const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
//   const newSlug = await ensureUniqueSlug(baseSlug, slugExists);
//
//   const updateData: any = {
//     name: trimmedName,
//     slug: newSlug,
//     description: description.trim(),
//     price: parseFloat(String(price)),
//     discount: discount ? parseFloat(String(discount)) : 0,
//     inventory: inventory ? parseInt(String(inventory), 10) : 0,
//     status: status || existing.status,
//     material: {
//       connect: { id: material.id },
//     },
//     type: {
//       connect: { id: type.id },
//     },
//     brand: {
//       connect: { id: brand.id },
//     },
//   };
//
//   if (
//     imageFilenames &&
//     Array.isArray(imageFilenames) &&
//     imageFilenames.length > 0
//   ) {
//     const existingImages = await getProductImages(existing.id);
//     const existingImageMap = new Map(
//       existingImages.map((img) => [img.id, img])
//     );
//
//     let imageIdsArray: number[] = [];
//     if (imageIds) {
//       if (Array.isArray(imageIds)) {
//         imageIdsArray = imageIds
//           .map((id: any) => Number(id))
//           .filter((id: number) => !isNaN(id) && id > 0);
//       } else if (typeof imageIds === "string") {
//         imageIdsArray = imageIds
//           .split(",")
//           .map((id: string) => Number(id.trim()))
//           .filter((id: number) => !isNaN(id) && id > 0);
//       }
//     }
//
//     if (imageIdsArray.length === 0) {
//       throw createError({
//         message: "Image IDs are required when uploading new images.",
//         status: 400,
//         code: errorCode.invalid,
//       });
//     }
//
//     if (imageIdsArray.length !== imageFilenames.length) {
//       throw createError({
//         message: `Number of image IDs (${imageIdsArray.length}) must match number of uploaded files (${imageFilenames.length}).`,
//         status: 400,
//         code: errorCode.invalid,
//       });
//     }
//
//     for (const imageId of imageIdsArray) {
//       const image = existingImageMap.get(imageId);
//       if (!image) {
//         throw createError({
//           message: `Image with ID ${imageId} does not belong to this product.`,
//           status: 400,
//           code: errorCode.invalid,
//         });
//       }
//     }
//
//     for (let i = 0; i < imageFilenames.length; i++) {
//       const imageId = imageIdsArray[i];
//       const imageFilename = imageFilenames[i];
//       if (!imageFilename || !imageId) continue;
//
//       const existingImage = existingImageMap.get(imageId);
//       if (existingImage) {
//         const oldImagePath = getFilePath(
//           "uploads",
//           "images",
//           "product",
//           existingImage.path
//         );
//         removeFile(oldImagePath);
//
//         await updateProductImage(imageId, imageFilename);
//       }
//     }
//   }
//
//   await updateProduct(existing.id, updateData);
//
//   const productWithImages = await getProductBySlug(newSlug);
//
//   return productWithImages;
// };

export const validateAndUpdateProduct = async (
  slug: string,
  params: UpdateProductNewParams
) => {
  const {
    name,
    description,
    concentration,
    gender,
    brandId,
    isActive,
    isLimited,
    releasedYear,
  } = params;

  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await getProductBySlug(slug);
  if (!existing) {
    throw createError({
      message: "Product not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();

  const existingByName = await getProductByNameExcludingId(
    trimmedName,
    existing.id
  );
  if (existingByName) {
    throw createError({
      message: "Product with this name already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const brandIdNum = parseInt(String(brandId), 10);
  if (isNaN(brandIdNum) || brandIdNum <= 0) {
    throw createError({
      message: "Invalid brand ID.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const brand = await findBrandById(brandIdNum);
  if (!brand) {
    throw createError({
      message: "Brand not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const baseSlug = createSlug(trimmedName);
  const slugOwner = await getProductBySlug(baseSlug);
  const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
  const newSlug = await ensureUniqueSlug(baseSlug, slugExists);

  const parsedReleasedYear =
    releasedYear !== undefined ? Number(releasedYear) : null;

  const updatedProduct = await prisma.product.update({
    where: { id: existing.id },
    data: {
      name: trimmedName,
      slug: newSlug,
      concentration,
      gender,
      description: trimmedDescription,
      isActive: typeof isActive === "boolean" ? isActive : existing.isActive,
      isLimited: typeof isLimited === "boolean" ? isLimited : existing.isLimited,
      releasedYear:
        parsedReleasedYear !== null && !isNaN(parsedReleasedYear)
          ? parsedReleasedYear
          : existing.releasedYear,
      brand: {
        connect: { id: brand.id },
      },
    },
    include: {
      brand: true,
    },
  });

  return updatedProduct;
};

// export const validateAndDeleteProduct = async (slug: string) => {
//   if (!slug || slug.trim().length === 0) {
//     throw createError({
//       message: "Slug parameter is required.",
//       status: 400,
//       code: errorCode.invalid,
//     });
//   }
//
//   const existing = await getProductBySlug(slug);
//   if (!existing) {
//     throw createError({
//       message: "Product not found.",
//       status: 404,
//       code: errorCode.notFound,
//     });
//   }
//
//   const images = await getProductImages(existing.id);
//   for (const image of images) {
//     const imagePath = getFilePath("uploads", "images", "product", image.path);
//     removeFile(imagePath);
//   }
//
//   await deleteProduct(existing.id);
// };

export const validateAndDeleteProduct = async (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await getProductBySlug(slug);
  if (!existing) {
    throw createError({
      message: "Product not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  await deleteProduct(existing.id);
};

export const parseProductQueryParams = (
  query: any
): ParseProductQueryParamsResult => {
  const pageSizeParam = Number(query.pageSize);
  const pageSize =
    Number.isNaN(pageSizeParam) || pageSizeParam <= 0
      ? 10
      : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search =
    typeof query.search === "string" && query.search.trim().length > 0
      ? query.search.trim()
      : undefined;

  const brandSlug =
    typeof query.brandSlug === "string" && query.brandSlug.trim().length > 0
      ? query.brandSlug.trim()
      : undefined;

  let gender: Gender | undefined;
  if (typeof query.gender === "string") {
    const genderValue = query.gender.toUpperCase();
    if (Object.values(Gender).includes(genderValue as Gender)) {
      gender = genderValue as Gender;
    }
  }

  let concentration: Concentration | undefined;
  if (typeof query.concentration === "string") {
    const concentrationValue = query.concentration.toUpperCase();
    if (
      Object.values(Concentration).includes(concentrationValue as Concentration)
    ) {
      concentration = concentrationValue as Concentration;
    }
  }

  const parseBoolean = (value: any) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }
    return undefined;
  };

  const isActive = parseBoolean(query.isActive);
  const isLimited = parseBoolean(query.isLimited);
  return {
    pageSize,
    offset,
    search,
    brandSlug,
    gender,
    concentration,
    isActive,
    isLimited,
  };
};
