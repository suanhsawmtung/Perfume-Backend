import { Category, Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { CreateCategoryParams, ListCategoriesParams, ListCategoryResultT, ListCategoryT, UpdateCategoryParams } from "../../types/category";
import { ServiceResponseT } from "../../types/common";
import { createError, createSlug, ensureUniqueSlug } from "../../utils/common";
import {
    createCategoryRecord,
    deleteCategoryRecord,
    findCategoryByName,
    findCategoryByNameExcludingId,
    findCategoryBySlug,
    findCategoryBySlugWithPostCount,
    parseCategoryQueryParams,
    requireSlug,
    updateCategoryRecord,
} from "./category.helpers";
import { IAdminCategoryService } from "./category.interface";

export class AdminCategoryService implements IAdminCategoryService {
  async listCategories(
    params: ListCategoriesParams
  ): Promise<ServiceResponseT<ListCategoryResultT>> {
    const { pageSize, offset, search } = parseCategoryQueryParams(params);

    const where: Prisma.CategoryWhereInput = search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
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

  async getCategoryDetail(slug: string): Promise<ServiceResponseT<ListCategoryT>> {
    const normalizedSlug = requireSlug(slug);
    const category = await findCategoryBySlugWithPostCount(normalizedSlug);

    if (!category) {
      throw createError({
        message: "Category not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: category,
      message: null,
    };
  }

  async createCategory(params: CreateCategoryParams): Promise<ServiceResponseT<Category>> {
    const { name } = params;
    const trimmedName = name.trim();

    const existingByName = await findCategoryByName(trimmedName);
    if (existingByName) {
      throw createError({
        message: "Category with this name already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }

    const baseSlug = createSlug(trimmedName);
    const slugOwner = await findCategoryBySlug(baseSlug);
    const slugExists = !!slugOwner;
    const slug = await ensureUniqueSlug(baseSlug, slugExists);

    const category = await createCategoryRecord({
      name: trimmedName,
      slug,
    });

    return {
      success: true,
      data: category,
      message: "Category created successfully.",
    };
  }

  async updateCategory(
    slug: string,
    params: UpdateCategoryParams
  ): Promise<ServiceResponseT<Category>> {
    const { name } = params;
    const normalizedSlug = requireSlug(slug);

    const existing = await findCategoryBySlug(normalizedSlug);
    if (!existing) {
      throw createError({
        message: "Category not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const trimmedName = name.trim();
    const existingByName = await findCategoryByNameExcludingId(
      trimmedName,
      existing.id
    );

    if (existingByName) {
      throw createError({
        message: "Category with this name already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }

    const baseSlug = createSlug(trimmedName);
    const slugOwner = await findCategoryBySlug(baseSlug);
    const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
    const slugValue = await ensureUniqueSlug(baseSlug, slugExists);

    const category = await updateCategoryRecord(existing.id, {
      name: trimmedName,
      slug: slugValue,
    });

    return {
      success: true,
      data: category,
      message: "Category updated successfully.",
    };
  }

  async deleteCategory(slug: string): Promise<ServiceResponseT<null>> {
    const normalizedSlug = requireSlug(slug);
    const existing = await findCategoryBySlugWithPostCount(normalizedSlug);

    if (!existing) {
      throw createError({
        message: "Category not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    if (existing._count.posts > 0) {
      throw createError({
        message: "Category cannot be deleted as it is already being used in some posts.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    await deleteCategoryRecord(existing.id);

    return {
      success: true,
      data: null,
      message: "Category deleted successfully.",
    };
  }
}
