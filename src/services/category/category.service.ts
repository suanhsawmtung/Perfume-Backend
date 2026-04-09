import { Prisma } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import {
  CreateCategoryParams,
  ListCategoriesParams,
  UpdateCategoryParams,
} from "../../types/category";
import { createError, createSlug, ensureUniqueSlug } from "../../utils/common";
import {
  createCategoryRecord,
  deleteCategoryRecord,
  findCategoryByName,
  findCategoryByNameExcludingId,
  findCategoryBySlug,
  findCategoryBySlugWithPostCount,
  requireSlug,
  updateCategoryRecord
} from "./category.helpers";

export const listCategories = async ({
  pageSize,
  offset,
  search,
}: ListCategoriesParams) => {
  const where: Prisma.CategoryWhereInput = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  const total = await prisma.category.count({ where });
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const items = await prisma.category.findMany({
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
  });

  return {
    items,
    currentPage,
    totalPages,
    pageSize,
  };
};

export const listPublicCategories = async () => {
  return await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { createdAt: "asc" },
  });
};

export const getCategoryDetail = async (slug: string) => {
  const normalizedSlug = requireSlug(slug);
  const category = await findCategoryBySlugWithPostCount(normalizedSlug);

  if (!category) {
    throw createError({
      message: "Category not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return category;
};

export const createCategory = async (params: CreateCategoryParams) => {
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

  return await createCategoryRecord({
    name: trimmedName,
    slug,
  });
};

export const updateCategory = async (
  slug: string,
  params: UpdateCategoryParams
) => {
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

  return await updateCategoryRecord(existing.id, {
    name: trimmedName,
    slug: slugValue,
  });
};

export const deleteCategory = async (slug: string) => {
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
};
