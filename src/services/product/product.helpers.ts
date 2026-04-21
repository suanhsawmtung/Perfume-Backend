import { Concentration, Gender, Prisma, VariantSource } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { generateCode } from "../../lib/unique-key-generator";
import {
  BuildProductWhereParams,
  ParseProductQueryParamsResult,
} from "../../types/product";
import { createError, createSlug, ensureUniqueSlug } from "../../utils/common";
import { getFilePath, removeFile } from "../../utils/file";

const parseBoolean = (value: any) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return undefined;
};

export const parseProductQueryParams = (
  query: any
): ParseProductQueryParamsResult => {
  const pageSizeParam = Number(query.limit);
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

export const buildProductWhere = ({
  search,
  brandSlug,
  gender,
  concentration,
  isActive,
  isLimited,
}: BuildProductWhereParams): Prisma.ProductWhereInput => {
  const whereConditions: Prisma.ProductWhereInput[] = [{ deletedAt: null }];

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

  return whereConditions.length > 0
    ? {
        AND: whereConditions,
      }
    : {};
};

export const requireSlug = (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return slug.trim();
};

export const requireVariantSlug = (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Variant slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return slug.trim();
};

export const requireSku = (sku: string) => {
  if (!sku || sku.trim().length === 0) {
    throw createError({
      message: "SKU parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return sku.trim();
};

export const findProductDetail = async (slug: string) => {
  return await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    include: {
      brand: true,
      variants: {
        where: { deletedAt: null },
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
          variants: true,
        },
      },
    },
  });
};

export const findProductVariantsSummary = async (slug: string) => {
  return await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    select: {
      name: true,
      slug: true,
      brand: {
        select: {
          name: true,
        },
      },
      variants: {
        where: { deletedAt: null },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          inventories: true,
        },
      },
    },
  });
};

export const findProductBySlug = async (slug: string) => {
  return await prisma.product.findFirst({
    where: { slug, deletedAt: null },
    include: {
      _count: {
        select: {
          variants: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });
};

export const findProductByName = async (name: string) => {
  return await prisma.product.findFirst({
    where: { name, deletedAt: null },
  });
};

export const findProductById = async (id: number) => {
  return await prisma.product.findFirst({
    where: { id, deletedAt: null },
  });
};

export const findProductVariantById = async (id: number) => {
  return await prisma.productVariant.findFirst({
    where: { id, deletedAt: null },
  });
};

export const findProductVariantBySku = async (sku: string) => {
  return await prisma.productVariant.findFirst({
    where: { sku, deletedAt: null },
  });
};

export const findProductVariantBySlug = async (slug: string) => {
  return await prisma.productVariant.findFirst({
    where: { slug, deletedAt: null },
  });
};

export const generateUniqueVariantSku = async (
  productId: number,
  size: number
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      name: true,
      brand: {
        select: { name: true },
      },
    },
  });

  const brandName = product?.brand?.name ?? "";
  const productName = product?.name ?? `product-${productId}`;
  const baseSku = createSlug(
    [brandName, productName, `${size}ml`].filter(Boolean).join(" ")
  ).toUpperCase();

  let sku = baseSku;
  let existing = await findProductVariantBySku(sku);
  let attempts = 0;
  const maxAttempts = 10;

  while (existing && attempts < maxAttempts) {
    sku = `${baseSku}-${generateCode(2).toUpperCase()}`;
    existing = await findProductVariantBySku(sku);
    attempts += 1;
  }

  if (existing) {
    sku = `${baseSku}-${Date.now().toString(36).toUpperCase()}`;
  }

  return sku;
};

export const generateUniqueVariantSlug = async (
  productSlug: string,
  size: number,
  source: VariantSource,
  excludeId?: number
) => {
  const baseSlug = createSlug(`${productSlug}-${size}-${source}`);
  const slugOwner = await findProductVariantBySlug(baseSlug);
  const slugExists = slugOwner ? slugOwner.id !== excludeId : false;
  return await ensureUniqueSlug(baseSlug, slugExists);
};

export const findProductVariantDetail = async (slug: string) => {
  return await prisma.productVariant.findFirst({
    where: {
      slug,
      deletedAt: null,
      product: { deletedAt: null },
    },
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
      inventories: true,
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          brand: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
};

export const createProductVariantRecord = async (
  createVariantData: Prisma.ProductVariantCreateInput
) => {
  return await prisma.productVariant.create({
    data: createVariantData,
  });
};

export const updateProductVariantRecord = async (
  id: number,
  updateVariantData: Prisma.ProductVariantUpdateInput
) => {
  return await prisma.productVariant.update({
    where: { id },
    data: updateVariantData,
  });
};

export const unsetOtherPrimaryVariants = async ({
  productId,
  variantId,
}: {
  productId: number;
  variantId: number;
}) => {
  return await prisma.productVariant.updateMany({
    where: {
      productId: productId,
      isPrimary: true,
      id: {
        not: variantId,
      },
    },
    data: { isPrimary: false },
  });
};

export const deleteProductVariantRecord = async (id: number) => {
  return await prisma.productVariant.update({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
};

export const deleteProductVariantFully = (variantId: number) => {
  return prisma.$transaction(async (tx) => {
    await tx.image.deleteMany({
      where: { productVariantId: variantId },
    });

    await tx.inventory.deleteMany({
      where: { productVariantId: variantId },
    });

    await tx.productVariant.delete({
      where: { id: variantId },
    });
  });
};

export const createVariantImages = async (
  productVariantId: number,
  imageFilenames: string[]
) => {
  if (imageFilenames.length === 0) return;

  await prisma.image.createMany({
    data: imageFilenames.map((filename, index) => ({
      path: filename,
      isPrimary: index === 0,
      order: index,
      productVariantId,
    })),
  });
};

export const findVariantImages = async (productVariantId: number) => {
  return await prisma.image.findMany({
    where: { productVariantId },
  });
};

export const deleteVariantImages = async (productVariantId: number) => {
  return await prisma.image.deleteMany({
    where: { productVariantId },
  });
};

export const findVariantInventory = async (productVariantId: number) => {
  return await prisma.inventory.findFirst({
    where: { productVariantId },
  });
};

export const createVariantInventory = async ({
  productVariantId,
  quantity,
  reserved = 0,
}: {
  productVariantId: number;
  quantity: number;
  reserved?: number;
}) => {
  return await prisma.inventory.create({
    data: {
      productVariantId,
      quantity,
      // reserved,
    },
  });
};

export const updateVariantInventory = async ({
  id,
  data
}: {
  id: number;
  data: Prisma.InventoryUpdateInput;
}) => {
  return await prisma.inventory.update({
    where: { id },
    data,
  });
};

export const incrementVariantInventory = async (
  productVariantId: number,
  quantity: number
) => {
  const existingInventory = await findVariantInventory(productVariantId);
  if (!existingInventory) {
    return await createVariantInventory({ productVariantId, quantity });
  }

  return await prisma.inventory.update({
    where: { id: existingInventory.id },
    data: { quantity: existingInventory.quantity + quantity },
  });
};

export const decrementVariantInventory = async (
  productVariantId: number,
  quantity: number
) => {
  const existingInventory = await findVariantInventory(productVariantId);
  if (!existingInventory) {
    return await createVariantInventory({ productVariantId, quantity });
  }

  return await prisma.inventory.update({
    where: { id: existingInventory.id },
    data: { quantity: existingInventory.quantity - quantity },
  });
};

export const deleteVariantInventories = async (productVariantId: number) => {
  return await prisma.inventory.deleteMany({
    where: { productVariantId },
  });
};

export const findProductByNameExcludingId = async (
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

export const insertProduct = async (
  createProductData: Prisma.ProductCreateInput
) => {
  return await prisma.product.create({
    data: createProductData,
    include: {
      brand: true,
    },
  });
};

export const updateProductRecord = async (
  id: number,
  updateProductData: Prisma.ProductUpdateInput
) => {
  return await prisma.product.update({
    where: { id },
    data: updateProductData,
    include: {
      brand: true,
    },
  });
};

export const deleteProductRecord = async (id: number) => {
  const deletedAt = new Date();
  const deletedAtSuffix = deletedAt.toISOString().replace(/[:.]/g, "-");

  const { variantIds, images } = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id },
      select: { slug: true },
    });

    const variants = await tx.productVariant.findMany({
      where: { productId: id, deletedAt: null },
      select: { id: true, slug: true, sku: true },
    });
    const variantIds = variants.map((variant) => variant.id);

    await tx.product.update({
      where: { id },
      data: {
        deletedAt,
        slug: `${product?.slug ?? id}-deleted-at-${deletedAtSuffix}`,
      },
    });

    if (variantIds.length > 0) {
      await Promise.all(
        variants.map((variant) =>
          tx.productVariant.update({
            where: { id: variant.id },
            data: {
              deletedAt,
              slug: `${variant.slug}-deleted-at-${deletedAtSuffix}`,
              sku: `${variant.sku}-deleted-at-${deletedAtSuffix}`,
            },
          })
        )
      );
    }

    const images = variantIds.length
      ? await tx.image.findMany({
          where: { productVariantId: { in: variantIds } },
          select: { id: true, path: true },
        })
      : [];

    return { variantIds, images };
  });

  if (images.length > 0) {
    await Promise.all(
      images.map((image) =>
        removeFile(getFilePath("uploads", "images", "product", image.path))
      )
    );

    await prisma.$transaction(async (tx) => {
      await tx.image.deleteMany({
        where: { id: { in: images.map((image) => image.id) } },
      });
    });
  }

  return { deletedAt, variantIds, images };
};
