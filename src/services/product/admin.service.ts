import { Prisma, Product, ProductVariant, VariantSource } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
  CreateProductParams,
  CreateProductVariantParams,
  ListProductResultT,
  ListProductsParams,
  ProductVariantDetailType,
  UpdateProductNewParams,
  UpdateProductVariantParams,
} from "../../types/product";
import { createError, createSlug, ensureUniqueSlug } from "../../utils/common";
import { getFilePath, removeFile } from "../../utils/file";
import {
  buildProductWhere,
  deleteProductRecord,
  deleteProductVariantFully,
  findProductByName,
  findProductByNameExcludingId,
  findProductBySlug,
  findProductDetail,
  findProductVariantBySlug,
  findProductVariantDetail,
  findVariantImages,
  generateUniqueVariantSku,
  generateUniqueVariantSlug,
  insertProduct,
  parseProductQueryParams,
  requireSlug,
  requireVariantSlug,
  updateProductRecord
} from "./product.helpers";
import { IAdminProductService } from "./product.interface";

export class AdminProductService implements IAdminProductService {
  async listProducts(
    params: ListProductsParams
  ): Promise<ServiceResponseT<ListProductResultT>> {
    const {
      pageSize,
      offset,
      search,
      brandSlug,
      gender,
      concentration,
      isActive,
      isLimited,
    } = parseProductQueryParams(params);

    const where = buildProductWhere({
      search,
      brandSlug,
      gender,
      concentration,
      isActive,
      isLimited,
    });

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          brand: {
            select: { name: true },
          },
          _count: {
            select: { variants: { where: { deletedAt: null } } },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items as any[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async getProductDetail(slug: string): Promise<ServiceResponseT<any>> {
    const normalizedSlug = requireSlug(slug);
    const product = await findProductDetail(normalizedSlug);

    if (!product) {
      throw createError({
        message: "Product not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: product,
      message: null,
    };
  }

  async createProduct(
    params: CreateProductParams
  ): Promise<ServiceResponseT<Product>> {
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
    const existing = await findProductByName(trimmedName);
    if (existing) {
      throw createError({
        message: "Product with this name already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }

    const baseSlug = createSlug(trimmedName);
    const slugOwner = await findProductBySlug(baseSlug);
    const slugExists = !!slugOwner;
    const slug = await ensureUniqueSlug(baseSlug, slugExists);

    const createData: Prisma.ProductCreateInput = {
      name: trimmedName,
      slug,
      description,
      concentration,
      gender,
      releasedYear: releasedYear ? Number(releasedYear) : null,
      brand: { connect: { id: Number(brandId) } },
    };

    if (isActive !== undefined) createData.isActive = isActive;
    if (isLimited !== undefined) createData.isLimited = isLimited;

    const product = await insertProduct(createData);

    return {
      success: true,
      data: product,
      message: "Product created successfully.",
    };
  }

  async updateProduct(
    slug: string,
    params: UpdateProductNewParams
  ): Promise<ServiceResponseT<Product>> {
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
    const existing = await findProductBySlug(normalizedSlug);
    if (!existing) {
      throw createError({
        message: "Product not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const trimmedName = name.trim();
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

    const baseSlug = createSlug(trimmedName);
    const slugOwner = await findProductBySlug(baseSlug);
    const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
    const slugValue = await ensureUniqueSlug(baseSlug, slugExists);

    const updateData: Prisma.ProductUpdateInput = {
      name: trimmedName,
      slug: slugValue,
      description,
      concentration,
      gender,
      releasedYear: releasedYear ? Number(releasedYear) : null,
      brand: { connect: { id: Number(brandId) } },
    };

    if (isActive !== undefined) updateData.isActive = isActive;
    if (isLimited !== undefined) updateData.isLimited = isLimited;

    const product = await updateProductRecord(existing.id, updateData);

    return {
      success: true,
      data: product,
      message: "Product updated successfully.",
    };
  }

  async deleteProduct(slug: string): Promise<ServiceResponseT<null>> {
    const normalizedSlug = requireSlug(slug);
    const product = await findProductBySlug(normalizedSlug);

    if (!product) {
      throw createError({
        message: "Product not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    await deleteProductRecord(product.id);

    return {
      success: true,
      data: null,
      message: "Product deleted successfully.",
    };
  }

  async createVariant(
    params: CreateProductVariantParams
  ): Promise<ServiceResponseT<ProductVariant>> {
    const {
      productId,
      size,
      source,
      price,
      discount,
      imageFilenames,
      isPrimary,
      isActive,
    } = params;

    if (!productId) {
      throw createError({
        message: "Product ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId), deletedAt: null },
    });

    if (!product) {
      throw createError({
        message: "Product not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const variantSource = source || VariantSource.ORIGINAL;
    const variantSize = Number(size);

    const skuFinal = await generateUniqueVariantSku(
      Number(productId),
      variantSize
    );

    const slug = await generateUniqueVariantSlug(
      product.slug,
      variantSize,
      variantSource
    );

    const variant = await prisma.$transaction(async (tx) => {
      const newVariant = await tx.productVariant.create({
        data: {
          productId: Number(productId),
          sku: skuFinal,
          slug,
          size: variantSize,
          source: variantSource,
          price: Number(price),
          discount: discount ? Number(discount) : 0,
          isPrimary: !!isPrimary,
          isActive: isActive !== undefined ? !!isActive : true,
        },
      });

      if (isPrimary) {
        await tx.productVariant.updateMany({
          where: {
            productId: Number(productId),
            isPrimary: true,
            id: { not: newVariant.id },
          },
          data: { isPrimary: false },
        });
      }

      if (imageFilenames && imageFilenames.length > 0) {
        await tx.image.createMany({
          data: imageFilenames.map((filename, index) => ({
            path: filename,
            isPrimary: index === 0,
            order: index,
            productVariantId: newVariant.id,
          })),
        });
      }

      await tx.inventory.create({
        data: {
          productVariantId: newVariant.id,
          quantity: 0,
        },
      });

      return newVariant;
    });

    return {
      success: true,
      data: variant,
      message: "Variant created successfully.",
    };
  }

  async updateVariant(
    variantSlug: string,
    params: UpdateProductVariantParams
  ): Promise<ServiceResponseT<ProductVariant>> {
    const {
      size,
      source,
      price,
      discount,
      imageFilenames,
      // existingImages,
      imageLayout,
      isPrimary,
      isActive,
    } = params;

    const normalizedSlug = requireVariantSlug(variantSlug);
    const existing = await findProductVariantBySlug(normalizedSlug);

    if (!existing) {
      throw createError({
        message: "Product variant not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const variantSize = size ? Number(size) : existing.size;
    const variantSource = source || existing.source;

    // Handle slug change if size or source changed
    let slug = existing.slug;
    if (variantSize !== existing.size || variantSource !== existing.source) {
      const product = await prisma.product.findUnique({
        where: { id: existing.productId },
      });
      if (product) {
        slug = await generateUniqueVariantSlug(
          product.slug,
          variantSize,
          variantSource,
          existing.id
        );
      }
    }

    const variant = await prisma.$transaction(async (tx) => {
      const updateData: Prisma.ProductVariantUpdateInput = {
        size: variantSize,
        source: variantSource,
        slug,
      };

      if (price !== undefined) updateData.price = Number(price);
      if (discount !== undefined) updateData.discount = Number(discount);
      if (isPrimary !== undefined) updateData.isPrimary = !!isPrimary;
      if (isActive !== undefined) updateData.isActive = !!isActive;

      const updatedVariant = await tx.productVariant.update({
        where: { id: existing.id },
        data: updateData,
      });

      if (isPrimary) {
        await tx.productVariant.updateMany({
          where: {
            productId: existing.productId,
            isPrimary: true,
            id: { not: existing.id },
          },
          data: { isPrimary: false },
        });
      }

      // Image Management Logic (Syncing existing and new files)
      if (imageLayout) {
        const currentImages = await tx.image.findMany({
          where: { productVariantId: existing.id },
        });

        const imagesToDelete = currentImages.filter(
          (img) => !imageLayout.includes(img.path)
        );

        if (imagesToDelete.length > 0) {
          for (const img of imagesToDelete) {
            await removeFile(
              getFilePath("uploads", "images", "product", img.path)
            );
          }
          await tx.image.deleteMany({
            where: { id: { in: imagesToDelete.map((i) => i.id) } },
          });
        }

        const newImages = imageFilenames?.filter((filename) => !currentImages.some((img) => img.path === filename)) || [];

        // Re-order and sync
        for (let i = 0; i < imageLayout.length; i++) {
          const isNew = imageLayout[i] === "__NEW__";

          if(!isNew) continue;

          const path = newImages.shift();
          if(!path) continue;

          await tx.image.create({
            data: {
              path,
              isPrimary: i === 0,
              order: i,
              productVariantId: existing.id,
            }
          });
        }
      }

      return updatedVariant;
    });

    return {
      success: true,
      data: variant,
      message: "Variant updated successfully.",
    };
  }

  async deleteVariant(variantSlug: string): Promise<ServiceResponseT<null>> {
    const normalizedSlug = requireVariantSlug(variantSlug);
    const variant = await findProductVariantBySlug(normalizedSlug);

    if (!variant) {
      throw createError({
        message: "Product variant not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const images = await findVariantImages(variant.id);
    await deleteProductVariantFully(variant.id);

    if (images.length > 0) {
      for (const img of images) {
        await removeFile(getFilePath("uploads", "images", "product", img.path));
      }
    }

    return {
      success: true,
      data: null,
      message: "Variant deleted successfully.",
    };
  }

  async getVariantDetail(variantSlug: string): Promise<ServiceResponseT<ProductVariantDetailType>> {
    const normalizedSlug = requireVariantSlug(variantSlug);
    const variant = await findProductVariantDetail(normalizedSlug);

    if (!variant) {
      throw createError({
        message: "Variant not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: variant,
      message: null,
    };
  }
}
