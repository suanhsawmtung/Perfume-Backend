import { PostStatus } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import {
  CreatePostParams,
  ListPostsParams,
  UpdatePostParams
} from "../../types/post";
import { createError, createSlug, ensureUniqueSlug } from "../../utils/common";
import { getFilePath, removeFile } from "../../utils/file";
import { findCategoryById } from "../category/category.helpers";
import { getRoleOrThrow } from "../user/user.helpers";
import { assertPostMutable, assertPostReadable, buildPostWhere, deletePostRecord, findPostBySlug, findPostByTitle, findPostByTitleExcludingId, findPostDetail, insertPost, requireAuthenticatedUserId, requireSlug, updatePostRecord } from "./post.helpers";

export const listPosts = async ({
  pageSize,
  offset,
  search,
  categorySlug,
  status,
  authenticatedUserId,
}: ListPostsParams) => {

  const where = await buildPostWhere({
    ...(authenticatedUserId ? { authenticatedUserId } : {}),
    ...(search ? { search } : {}),
    ...(categorySlug ? { categorySlug } : {}),
    ...(status ? { status } : {}),
  });

  // Get total count for pagination
  const total = await prisma.post.count({ where });

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  // Calculate current page (0-based offset to 1-based page)
  const currentPage = Math.floor(offset / pageSize) + 1;

  // Fetch posts with offset pagination
  const items = await prisma.post.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { createdAt: "desc" },
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

  return {
    items,
    currentPage,
    totalPages,
    pageSize,
  };
};

export const getPostDetail = async (
  slug: string,
  authenticatedUserId?: number
) => {
  const normalizedSlug = requireSlug(slug);
  const userId = requireAuthenticatedUserId(authenticatedUserId);
  const role = await getRoleOrThrow(userId);
  const post = await findPostDetail(normalizedSlug);

  if (!post) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  assertPostReadable(post, role, userId);

  return post;
};

export const createPost = async (params: CreatePostParams) => {
  const {
    title,
    excerpt,
    content,
    status,
    categoryId,
    imageFilename,
    authenticatedUserId,
  } = params;

  if (!authenticatedUserId) {
    throw createError({
      message: "User ID is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const trimmedTitle = title.trim();

  const existingByTitle = await findPostByTitle(trimmedTitle);

  if (existingByTitle) {
    throw createError({
      message: "Post with this title already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const categoryIdNum = parseInt(String(categoryId), 10);
  if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
    throw createError({
      message: "Invalid category ID.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const category = await findCategoryById(categoryIdNum);
  if (!category) {
    throw createError({
      message: "Category not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const baseSlug = createSlug(trimmedTitle);
  const slugOwner = await findPostBySlug(baseSlug);
  const slugExists = !!slugOwner;
  const slug = await ensureUniqueSlug(baseSlug, slugExists);

  const normalizedStatus = status ?? PostStatus.DRAFT;

  const post = await insertPost({
    title: trimmedTitle,
    slug,
    excerpt: excerpt.trim(),
    content: content.trim(),
    image: imageFilename || "",
    status: normalizedStatus,
    publishedAt: normalizedStatus === PostStatus.PUBLISHED ? new Date() : null,
    author: {
      connect: { id: authenticatedUserId },
    },
    category: {
      connect: { id: category.id },
    },
  });

  return post;
};

export const updatePost = async (
  slug: string,
  params: UpdatePostParams
) => {
  const {
    title,
    excerpt,
    content,
    status,
    categoryId,
    imageFilename,
    authenticatedUserId,
  } = params;

  const normalizedSlug = requireSlug(slug);
  const userId = requireAuthenticatedUserId(authenticatedUserId);
  const role = await getRoleOrThrow(userId);
  const existing = await findPostBySlug(normalizedSlug);
  if (!existing) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  assertPostMutable(existing, role, userId, "Not allowed to update this post.");

  const trimmedTitle = title.trim();

  const existingByTitle = await findPostByTitleExcludingId(
    trimmedTitle,
    existing.id
  );
  if (existingByTitle) {
    throw createError({
      message: "Post with this title already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const categoryIdNum = parseInt(String(categoryId), 10);
  if (isNaN(categoryIdNum) || categoryIdNum <= 0) {
    throw createError({
      message: "Invalid category ID.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const category = await findCategoryById(categoryIdNum);
  if (!category) {
    throw createError({
      message: "Category not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const baseSlug = createSlug(trimmedTitle);
  const slugOwner = await findPostBySlug(baseSlug);
  const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
  const newSlug = await ensureUniqueSlug(baseSlug, slugExists);

  const updateData: any = {
    title: trimmedTitle,
    slug: newSlug,
    excerpt: excerpt.trim(),
    content: content.trim(),
    category: {
      connect: { id: category.id },
    },
  };

  if (status) {
    updateData.status = status;
    if (status === PostStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    }
  }

  if (imageFilename) {
    if (existing.image) {
      const oldImagePath = getFilePath(
        "uploads",
        "images",
        "post",
        existing.image
      );
      removeFile(oldImagePath);
    }
    updateData.image = imageFilename;
  }

  const post = await updatePostRecord(existing.id, updateData);

  return post;
};

export const deletePost = async (
  slug: string,
  authenticatedUserId?: number
) => {
  const normalizedSlug = requireSlug(slug);
  const userId = requireAuthenticatedUserId(authenticatedUserId);
  const role = await getRoleOrThrow(userId);
  const existing = await findPostBySlug(normalizedSlug);
  if (!existing) {
    throw createError({
      message: "Post not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  assertPostMutable(existing, role, userId, "Not allowed to delete this post.");

  if (existing.image) {
    const imagePath = getFilePath("uploads", "images", "post", existing.image);
    removeFile(imagePath);
  }

  await deletePostRecord(existing.id);
};


