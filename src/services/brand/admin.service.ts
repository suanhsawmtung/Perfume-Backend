import { Brand } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { CreateBrandParams, ListBrandResultT, ListBrandsParams, ListBrandT, UpdateBrandParams } from "../../types/brand";
import { ServiceResponseT } from "../../types/common";
import { createError, createSlug, ensureUniqueSlug } from "../../utils/common";
import {
    buildBrandWhereClause,
    createBrandRecord,
    deleteBrandRecord,
    findBrandByName,
    findBrandByNameExcludingId,
    findBrandBySlug,
    findBrandBySlugWithProductCount,
    parseBrandQueryParams,
    requireSlug,
    updateBrandRecord,
} from "./brand.helpers";
import { IAdminBrandService } from "./brand.interface";

export class AdminBrandService implements IAdminBrandService {
  async listBrands(
    params: ListBrandsParams
  ): Promise<ServiceResponseT<ListBrandResultT>> {
    const { pageSize, offset, search } = parseBrandQueryParams(params);
    const where = buildBrandWhereClause({ search });

    const [items, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      }),
      prisma.brand.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items,
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async getBrandDetail(
    slug: string
  ): Promise<ServiceResponseT<ListBrandT>> {
    const normalizedSlug = requireSlug(slug);
    const brand = await findBrandBySlugWithProductCount(normalizedSlug);

    if (!brand) {
      throw createError({
        message: "Brand not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: brand,
      message: null,
    };
  }

  async createBrand(
    params: CreateBrandParams
  ): Promise<ServiceResponseT<Brand>> {
    const { name } = params;
    const trimmedName = name.trim();

    const existingByName = await findBrandByName(trimmedName);
    if (existingByName) {
      throw createError({
        message: "Brand with this name already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }

    const baseSlug = createSlug(trimmedName);
    const slugOwner = await findBrandBySlug(baseSlug);
    const slugExists = !!slugOwner;
    const slug = await ensureUniqueSlug(baseSlug, slugExists);

    return {
      success: true,
      data: await createBrandRecord({
        name: trimmedName,
        slug,
      }),
      message: "Brand created successfully.",
    };
  }

  async updateBrand(
    slug: string,
    params: UpdateBrandParams
  ): Promise<ServiceResponseT<Brand>> {
    const { name } = params;
    const normalizedSlug = requireSlug(slug);

    const existing = await findBrandBySlug(normalizedSlug);
    if (!existing) {
      throw createError({
        message: "Brand not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const trimmedName = name.trim();
    const existingByName = await findBrandByNameExcludingId(
      trimmedName,
      existing.id
    );

    if (existingByName) {
      throw createError({
        message: "Brand with this name already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }

    const baseSlug = createSlug(trimmedName);
    const slugOwner = await findBrandBySlug(baseSlug);
    const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
    const slugValue = await ensureUniqueSlug(baseSlug, slugExists);

    return {
      success: true,
      data: await updateBrandRecord(existing.id, {
        name: trimmedName,
        slug: slugValue,
      }),
      message: "Brand updated successfully.",
    }
  }

  async deleteBrand(slug: string): Promise<ServiceResponseT<null>> {
    const normalizedSlug = requireSlug(slug);
    const existing = await findBrandBySlugWithProductCount(normalizedSlug);

    if (!existing) {
      throw createError({
        message: "Brand not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    if (existing._count.products > 0) {
      throw createError({
        message: "Brand cannot be deleted as it is already being used in some products.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    await deleteBrandRecord(existing.id);

    return {
      success: true,
      data: null,
      message: "Brand deleted successfully.",
    };
  }
}
