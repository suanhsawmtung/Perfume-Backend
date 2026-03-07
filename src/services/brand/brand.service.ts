import { Prisma } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import { CreateBrandParams, ListBrandsParams, UpdateBrandParams } from "../../types/brand";
import { createError, createSlug, ensureUniqueSlug } from "../../utils/common";
import {
  createBrandRecord,
  deleteBrandRecord,
  findBrandByName,
  findBrandByNameExcludingId,
  findBrandBySlug,
  findBrandBySlugWithProductCount,
  requireSlug,
  updateBrandRecord,
} from "./brand.helpers";

export const listBrands = async ({
  pageSize,
  offset,
  search,
}: ListBrandsParams) => {
  const where: Prisma.BrandWhereInput = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  const total = await prisma.brand.count({ where });
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const items = await prisma.brand.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: {
          products: true,
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

export const listPublicBrands = async () => {
  return await prisma.brand.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { id: "asc" },
  });
};

export const getBrandDetail = async (slug: string) => {
  const normalizedSlug = requireSlug(slug);
  const brand = await findBrandBySlugWithProductCount(normalizedSlug);

  if (!brand) {
    throw createError({
      message: "Brand not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return brand;
};

export const createBrand = async (params: CreateBrandParams) => {
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

  return await createBrandRecord({
    name: trimmedName,
    slug,
  });
};

export const updateBrand = async (slug: string, params: UpdateBrandParams) => {
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

  return await updateBrandRecord(existing.id, {
    name: trimmedName,
    slug: slugValue,
  });
};

export const deleteBrand = async (slug: string) => {
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
};
