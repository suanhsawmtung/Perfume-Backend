import { PostStatus, Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import { ListPostResultT, ListPostsParams, ListPostT, PostDetailT } from "../../types/post";
import { createError } from "../../utils/common";
import {
  findPostDetail,
  parsePostQueryParams,
  requireSlug
} from "./post.helpers";
import { IPostService } from "./post.interface";

export class PostService implements IPostService {
  async listPosts(
    params: ListPostsParams
  ): Promise<ServiceResponseT<ListPostResultT>> {
    const { pageSize, offset, search, categorySlug } = parsePostQueryParams(params);

    const where: Prisma.PostWhereInput = {
      status: PostStatus.PUBLISHED,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          publishedAt: true,
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
              id: true,
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

  async getPostDetail(slug: string): Promise<ServiceResponseT<PostDetailT>> {
    const normalizedSlug = requireSlug(slug);
    const post = await findPostDetail(normalizedSlug);

    if (!post || post.status !== PostStatus.PUBLISHED) {
      throw createError({
        message: "Post not found or unavailable.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: post as PostDetailT,
      message: null,
    };
  }
}
