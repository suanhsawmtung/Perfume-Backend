import { Post, PostStatus, Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
    CreatePostParams,
    ListPostResultT,
    ListPostsParams,
    ListPostT,
    UpdatePostParams,
} from "../../types/post";
import { createError, createSlug, ensureUniqueSlug } from "../../utils/common";
import {
    buildPostWhere,
    deletePostRecord,
    findPostBySlug,
    findPostByTitle,
    findPostByTitleExcludingId,
    findPostDetail,
    insertPost,
    parsePostQueryParams,
    requireSlug,
    updatePostRecord,
} from "./post.helpers";
import { IAdminPostService } from "./post.interface";

export class AdminPostService implements IAdminPostService {
  async listPosts(
    params: ListPostsParams
  ): Promise<ServiceResponseT<ListPostResultT>> {
    const { pageSize, offset, search, categorySlug, status } =
      parsePostQueryParams(params);

    const where = await buildPostWhere({
      search,
      categorySlug,
      status,
      ...(params.authenticatedUserId && { authenticatedUserId: params.authenticatedUserId }),
    });

    const [items, total] = await Promise.all([
      prisma.post.findMany({
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
              username: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items as ListPostT[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async getPostDetail(slug: string): Promise<ServiceResponseT<ListPostT>> {
    const normalizedSlug = requireSlug(slug);
    const post = await findPostDetail(normalizedSlug);

    if (!post) {
      throw createError({
        message: "Post not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: post as ListPostT,
      message: null,
    };
  }

  async createPost(params: CreatePostParams): Promise<ServiceResponseT<Post>> {
    const {
      title,
      excerpt,
      content,
      status,
      categoryId,
      imageFilename,
      authenticatedUserId,
    } = params;

    const trimmedTitle = title.trim();
    const existing = await findPostByTitle(trimmedTitle);

    if (existing) {
      throw createError({
        message: "Post with this title already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }

    const baseSlug = createSlug(trimmedTitle);
    const slugOwner = await findPostBySlug(baseSlug);
    const slugExists = !!slugOwner;
    const slug = await ensureUniqueSlug(baseSlug, slugExists);

    if (!authenticatedUserId) {
      throw createError({
        message: "User not authenticated.",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    const post = await insertPost({
      title: trimmedTitle,
      slug,
      excerpt,
      content,
      status: status || PostStatus.DRAFT,
      publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
      image: imageFilename || "",
      author: { connect: { id: authenticatedUserId } },
      category: { connect: { id: Number(categoryId) } },
    });

    return {
      success: true,
      data: post,
      message: "Post created successfully.",
    };
  }

  async updatePost(
    slug: string,
    params: UpdatePostParams
  ): Promise<ServiceResponseT<Post>> {
    const {
      title,
      excerpt,
      content,
      status,
      categoryId,
      imageFilename,
    } = params;

    const normalizedSlug = requireSlug(slug);
    const existing = await findPostBySlug(normalizedSlug);

    if (!existing) {
      throw createError({
        message: "Post not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

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

    const baseSlug = createSlug(trimmedTitle);
    const slugOwner = await findPostBySlug(baseSlug);
    const slugExists = slugOwner ? slugOwner.id !== existing.id : false;
    const slugValue = await ensureUniqueSlug(baseSlug, slugExists);

    const updateData: Prisma.PostUpdateInput = {
      title: trimmedTitle,
      slug: slugValue,
      excerpt,
      content,
      category: { connect: { id: Number(categoryId) } },
    };

    if (status) {
      updateData.status = status;
    }

    if (imageFilename) {
      updateData.image = imageFilename;
    }

    if (status === PostStatus.PUBLISHED && existing.status !== PostStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    }

    const post = await updatePostRecord(existing.id, updateData);

    return {
      success: true,
      data: post,
      message: "Post updated successfully.",
    };
  }

  async deletePost(slug: string): Promise<ServiceResponseT<null>> {
    const normalizedSlug = requireSlug(slug);
    const post = await findPostBySlug(normalizedSlug);

    if (!post) {
      throw createError({
        message: "Post not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    await deletePostRecord(post.id);

    return {
      success: true,
      data: null,
      message: "Post deleted successfully.",
    };
  }
}
