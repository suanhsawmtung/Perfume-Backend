import { VariantSource } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import {
    CreateProductParams,
    CreateProductVariantParams,
    ListProductsParams,
    UpdateProductNewParams,
    UpdateProductVariantParams,
} from "../../types/product";
import {
    createError,
    createSlug,
    ensureUniqueSlug,
    normalizeBoolean,
} from "../../utils/common";
import { getFilePath, removeFile } from "../../utils/file";
import { findBrandById } from "../brand/brand.helpers";
import {
    buildProductWhere,
    createProductVariantRecord,
    decrementVariantInventory,
    deleteProductRecord,
    deleteProductVariantRecord,
    deleteVariantImages,
    findProductByName,
    findProductByNameExcludingId,
    findProductBySlug,
    findProductDetail,
    findProductVariantDetail,
    findProductVariantsSummary,
    findVariantImages,
    generateUniqueVariantSku,
    generateUniqueVariantSlug,
    incrementVariantInventory,
    insertProduct,
    requireSlug,
    requireVariantSlug,
    unsetOtherPrimaryVariants,
    updateProductRecord,
    updateProductVariantRecord,
} from "./product.helpers";

export const listPublicProducts = async (limit?: number, cursor?: number) => {
  return await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    ...(limit ? { take: limit } : {}),
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      name: true,
      slug: true,
      brand: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });
};

export const listProducts = async ({
  pageSize,
  offset,
  search,
  brandSlug,
  gender,
  concentration,
  isActive,
  isLimited,
}: ListProductsParams) => {
  const where = buildProductWhere({
    ...(search ? { search } : {}),
    ...(brandSlug ? { brandSlug } : {}),
    ...(gender ? { gender } : {}),
    ...(concentration ? { concentration } : {}),
    ...(typeof isActive === "boolean" ? { isActive } : {}),
    ...(typeof isLimited === "boolean" ? { isLimited } : {}),
  });

  const total = await prisma.product.count({ where });
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

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

export const getProductDetail = async (slug: string) => {
  const normalizedSlug = requireSlug(slug);
  const product = await findProductDetail(normalizedSlug);

  if (!product) {
    throw createError({
      message: "Product not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return product;
};

export const getProductVariants = async (slug: string) => {
  const normalizedSlug = requireSlug(slug);
  const product = await findProductVariantsSummary(normalizedSlug);

  if (!product) {
    throw createError({
      message: "Product not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return product;
};

export const getProductVariantDetail = async (variantSlug: string) => {
  const normalizedVariantSlug = requireVariantSlug(variantSlug);
  const variant = await findProductVariantDetail(normalizedVariantSlug);

  if (!variant) {
    throw createError({
      message: "Product variant not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return variant;
};

export const createProduct = async (params: CreateProductParams) => {
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

  const existingByName = await findProductByName(trimmedName);
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
  const slugOwner = await findProductBySlug(baseSlug);
  const slugExists = !!slugOwner;
  const slug = await ensureUniqueSlug(baseSlug, slugExists);

  const parsedReleasedYear =
    releasedYear !== undefined ? Number(releasedYear) : null;

  return await insertProduct({
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
  });
};

export const updateProduct = async (
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

  const normalizedSlug = requireSlug(slug);
  const existing = await findProductDetail(normalizedSlug);
  if (!existing) {
    throw createError({
      message: "Product not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();

  const existingByName = await findProductByNameExcludingId(
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
  const slugOwner = await findProductBySlug(baseSlug);
  const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
  const newSlug = await ensureUniqueSlug(baseSlug, slugExists);

  const parsedReleasedYear =
    releasedYear !== undefined ? Number(releasedYear) : null;

  return await updateProductRecord(existing.id, {
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
  });
};

export const deleteProduct = async (slug: string) => {
  const normalizedSlug = requireSlug(slug);
  const existing = await findProductDetail(normalizedSlug);
  if (!existing) {
    throw createError({
      message: "Product not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  await deleteProductRecord(existing.id);
};

export const createProductVariant = async (
  productSlug: string,
  params: CreateProductVariantParams
) => {
  const normalizedSlug = requireSlug(productSlug);
  const product = await findProductBySlug(normalizedSlug);
  if (!product) {
    throw createError({
      message: "Product not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  if (params.productId !== undefined) {
    const productIdNum = parseInt(String(params.productId), 10);
    if (isNaN(productIdNum) || productIdNum <= 0) {
      throw createError({
        message: "Invalid product ID.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    if (productIdNum !== product.id) {
      throw createError({
        message: "Product ID does not match slug.",
        status: 400,
        code: errorCode.invalid,
      });
    }
  }

  const sizeNum = parseInt(String(params.size), 10);
  if (isNaN(sizeNum) || sizeNum <= 0) {
    throw createError({
      message: "Invalid size.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const priceNum = Number(params.price);
  if (isNaN(priceNum) || priceNum < 0) {
    throw createError({
      message: "Invalid price.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const discountNum =
    params.discount !== undefined ? Number(params.discount) : 0;
  if (isNaN(discountNum) || discountNum < 0) {
    throw createError({
      message: "Invalid discount.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (discountNum > priceNum) {
    throw createError({
      message: "Discount cannot be greater than price.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const stockNum = params.stock !== undefined ? Number(params.stock) : 0;
  if (isNaN(stockNum) || stockNum < 0) {
    throw createError({
      message: "Invalid stock.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const isPrimary = normalizeBoolean(params.isPrimary, false);
  const isActive = normalizeBoolean(params.isActive, true);

  if (isPrimary && !isActive) {
    throw createError({
      message: "Primary variant must be active.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const source = params.source ?? VariantSource.ORIGINAL;
  const sku = await generateUniqueVariantSku(product.id, sizeNum);
  const variantSlug = await generateUniqueVariantSlug(
    product.slug,
    sizeNum,
    source
  );

  const variant = await createProductVariantRecord({
    slug: variantSlug,
    sku,
    size: sizeNum,
    source,
    price: priceNum,
    discount: discountNum,
    stock: stockNum,
    isPrimary,
    isActive,
    product: {
      connect: { id: product.id },
    },
    inventories: {
      create: {
        quantity: stockNum,
        reserved: 0,
      },
    },
    images: {
      create:
        params.imageFilenames?.map((filename, index) => ({
          path: filename,
          isPrimary: index === 0,
          order: index,
        })) ?? [],
    },
  });

  const detail = await findProductVariantDetail(variant.slug);

  if (detail?.isPrimary) {
    await unsetOtherPrimaryVariants({
      productId: product.id,
      variantId: variant.id,
    });
  }

  return detail;
};

export const updateProductVariant = async (
  productSlug: string,
  variantSlug: string,
  params: UpdateProductVariantParams
) => {
  const normalizedSlug = requireSlug(productSlug);
  const normalizedVariantSlug = requireVariantSlug(variantSlug);
  const product = await findProductBySlug(normalizedSlug);
  if (!product) {
    throw createError({
      message: "Product not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const existingVariant = await findProductVariantDetail(normalizedVariantSlug);
  if (!existingVariant) {
    throw createError({
      message: "Product variant not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  if (existingVariant.productId !== product.id) {
    throw createError({
      message: "Product variant does not belong to product.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (params.productId !== undefined) {
    const productIdNum = parseInt(String(params.productId), 10);
    if (isNaN(productIdNum) || productIdNum <= 0) {
      throw createError({
        message: "Invalid product ID.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    if (productIdNum !== product.id) {
      throw createError({
        message: "Product ID does not match slug.",
        status: 400,
        code: errorCode.invalid,
      });
    }
  }

  const sizeNum = parseInt(String(params.size), 10);
  if (isNaN(sizeNum) || sizeNum <= 0) {
    throw createError({
      message: "Invalid size.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const priceNum = Number(params.price);
  if (isNaN(priceNum) || priceNum < 0) {
    throw createError({
      message: "Invalid price.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const discountNum =
    params.discount !== undefined ? Number(params.discount) : 0;
  if (isNaN(discountNum) || discountNum < 0) {
    throw createError({
      message: "Invalid discount.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (discountNum > priceNum) {
    throw createError({
      message: "Discount cannot be greater than price.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const stockNum = params.stock !== undefined ? Number(params.stock) : 0;
  if (isNaN(stockNum) || stockNum < 0) {
    throw createError({
      message: "Invalid stock.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const source =
    params.source ?? existingVariant.source ?? VariantSource.ORIGINAL;
  const nextSku = await generateUniqueVariantSku(product.id, sizeNum);
  const nextSlug = await generateUniqueVariantSlug(
    product.slug,
    sizeNum,
    source,
    existingVariant.id
  );

  const updated = await updateProductVariantRecord(existingVariant.id, {
    slug: nextSlug,
    sku: nextSku,
    size: sizeNum,
    source,
    price: priceNum,
    discount: discountNum,
    stock: stockNum,
    ...(typeof params.isPrimary === "boolean"
      ? { isPrimary: params.isPrimary }
      : {}),
    ...(typeof params.isActive === "boolean"
      ? { isActive: params.isActive }
      : {}),
  });

  if (updated.isPrimary) {
    await unsetOtherPrimaryVariants({
      productId: Number(updated.productId),
      variantId: updated.id,
    });
  }

  // await updateVariantInventory(existingVariant.id, stockNum);
  const newStock = stockNum - existingVariant.stock;
  if(newStock < 0){
    await decrementVariantInventory(existingVariant.id, Math.abs(newStock));
  }else {
    await incrementVariantInventory(existingVariant.id, newStock);
  }

  // Handle images using Fixed Slot Sync (Orders 0-3)
  if (params.imageLayout) {
    const currentImages = await findVariantImages(existingVariant.id);
    const layout = params.imageLayout; // Expected length 4
    const newFiles = [...(params.imageFilenames || [])];
    
    // 1. Identify records that are being kept vs those available for reuse/deletion
    const keptPaths = layout.filter(item => item !== "__NEW__" && item !== "__EMPTY__");
    const availableRecords = currentImages.filter(img => !keptPaths.includes(img.path));
    
    const processedIds = new Set<number>();

    // 2. Process layout from 0 to 3
    for (let i = 0; i < 4; i++) {
        const target = layout[i];
        if (!target || target === "__EMPTY__") continue;

        if (target === "__NEW__") {
            const newPath = newFiles.shift();
            if (newPath) {
                // Prefer reusing a record that was exactly at this order
                const exactMatchIdx = availableRecords.findIndex(r => r.order === i);
                const recordToReuse = exactMatchIdx !== -1 
                    ? availableRecords.splice(exactMatchIdx, 1)[0] 
                    : availableRecords.shift();

                if (recordToReuse) {
                    // Cleanup old file
                    const oldFilePath = getFilePath("uploads", "images", "product", recordToReuse.path);
                    await removeFile(oldFilePath);

                    await prisma.image.update({
                        where: { id: recordToReuse.id },
                        data: {
                            path: newPath,
                            order: i,
                            isPrimary: i === 0
                        }
                    });
                    processedIds.add(recordToReuse.id);
                } else {
                    const newRecord = await prisma.image.create({
                        data: {
                            path: newPath,
                            order: i,
                            isPrimary: i === 0,
                            productVariantId: existingVariant.id
                        }
                    });
                    processedIds.add(newRecord.id);
                }
            }
        } else {
            // It's an existing path
            const record = currentImages.find(img => img.path === target);
            if (record) {
                await prisma.image.update({
                    where: { id: record.id },
                    data: {
                        order: i,
                        isPrimary: i === 0
                    }
                });
                processedIds.add(record.id);
            }
        }
    }

    // 3. Delete any remaining available records that weren't reused
    for (const record of availableRecords) {
        if (!processedIds.has(record.id)) {
            const oldFilePath = getFilePath("uploads", "images", "product", record.path);
            await removeFile(oldFilePath);
            await prisma.image.delete({ where: { id: record.id } });
        }
    }
  }

  const detail = await findProductVariantDetail(updated.slug);
  return detail;
};

export const deleteProductVariant = async (
  productSlug: string,
  variantSlug: string
) => {
  const normalizedSlug = requireSlug(productSlug);
  const normalizedVariantSlug = requireVariantSlug(variantSlug);
  const product = await findProductBySlug(normalizedSlug);
  if (!product) {
    throw createError({
      message: "Product not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const existingVariant = await findProductVariantDetail(normalizedVariantSlug);
  if (!existingVariant) {
    throw createError({
      message: "Product variant not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  if (existingVariant.productId !== product.id) {
    throw createError({
      message: "Product variant does not belong to product.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (existingVariant.isPrimary && product._count.variants > 1) {
    throw createError({
      message: "Primary variant cannot be deleted.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existingImages = await findVariantImages(existingVariant.id);

  await Promise.all(
    existingImages.map((image) => {
      const imagePath = getFilePath("uploads", "images", "product", image.path);
      return removeFile(imagePath);
    })
  );

  await deleteVariantImages(existingVariant.id);
  await deleteProductVariantRecord(existingVariant.id);
};
