import { PostStatus, Prisma, Role } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { BuildPostWhereParams, ParsePostQueryParamsResult } from "../../types/post";
import { createError } from "../../utils/common";
import { getRoleOrThrow } from "../user/user.helpers";

export const buildPostWhere = async ({
  authenticatedUserId,
  search,
  categorySlug,
  status,
}: BuildPostWhereParams) => {
  const whereConditions: Prisma.PostWhereInput[] = [];

  const userId = requireAuthenticatedUserId(authenticatedUserId);
  const role = await getRoleOrThrow(userId);

  if (search) {
    whereConditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        {
          author: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    });
  }

  if (categorySlug) {
    // Lightweight query: only select id field to get categoryId
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });

    if (category) {
      whereConditions.push({ categoryId: category.id });
    }
  }

  if (status) {
    const shouldApplyStatus =
      status !== PostStatus.ARCHIVED || role === Role.ADMIN;
    if (shouldApplyStatus) {
      whereConditions.push({ status });
    }
  }

  if (role !== Role.ADMIN) {
    whereConditions.push({ authorId: userId });
    whereConditions.push({ status: { not: PostStatus.ARCHIVED } });
  }

  const where: Prisma.PostWhereInput =
    whereConditions.length > 0
      ? {
          AND: whereConditions,
        }
      : {};

  return where;
};

export const findPostDetail = async (slug: string) => {
  return await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          username: true,
        },
      },
      category: true,
    },
  });
};

export const findPostBySlug = async (slug: string) => {
  return await prisma.post.findUnique({
    where: { slug },
  });
};

export const findPostByTitle = async (title: string) => {
  return await prisma.post.findFirst({
    where: { title },
  });
};

export const findPostByTitleExcludingId = async (
  title: string,
  excludeId: number
) => {
  return await prisma.post.findFirst({
    where: {
      title,
      NOT: { id: excludeId },
    },
  });
};

export const insertPost = async (createPostData: Prisma.PostCreateInput) => {
  return await prisma.post.create({
    data: createPostData,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      category: true,
    },
  });
};

export const updatePostRecord = async (
  id: number,
  updatePostData: Prisma.PostUpdateInput
) => {
  return await prisma.post.update({
    where: { id },
    data: updatePostData,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      category: true,
    },
  });
};

export const deletePostRecord = async (id: number) => {
  return await prisma.post.delete({
    where: { id },
  });
};

export const parsePostQueryParams = (
  query: any
): ParsePostQueryParamsResult => {
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

  const categorySlug =
    typeof query.category === "string" && query.category.trim().length > 0
      ? query.category.trim()
      : undefined;

  let status: PostStatus | undefined;
  if (typeof query.status === "string") {
    const statusValue = query.status.trim();
    if (Object.values(PostStatus).includes(statusValue as PostStatus)) {
      status = statusValue as PostStatus;
    }
  }

  return {
    pageSize,
    offset,
    search,
    categorySlug,
    status,
  };
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

export const requireAuthenticatedUserId = (authenticatedUserId?: number) => {
  if (!authenticatedUserId) {
    throw createError({
      message: "User ID is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return authenticatedUserId;
};

export const assertPostReadable = (
  post: { authorId: number; status: PostStatus },
  role: Role,
  authenticatedUserId: number
) => {
  if (role === Role.ADMIN) return;

  const isOwner = post.authorId === authenticatedUserId;
  const isArchived = post.status === PostStatus.ARCHIVED;
  if (!isOwner || isArchived) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }
};

export const assertPostMutable = (
  post: { authorId: number; status: PostStatus },
  role: Role,
  authenticatedUserId: number,
  message: string
) => {
  if (role === Role.ADMIN) return;

  const isOwner = post.authorId === authenticatedUserId;
  const isArchived = post.status === PostStatus.ARCHIVED;
  if (!isOwner || isArchived) {
    throw createError({
      message,
      status: 403,
      code: errorCode.notAllowed,
    });
  }
};