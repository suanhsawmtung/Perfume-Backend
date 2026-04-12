import { Post, PostStatus, User, Category } from "@prisma/client";

export type ListPostsParams = {
  limit?: number | string;
  offset?: number | string;
  authenticatedUserId?: number;
  search?: string | undefined;
  categorySlug?: string | undefined;
  status?: PostStatus | undefined;
};

export type ListPostT = Post & {
  author: Pick<User, "id" | "firstName" | "lastName" | "username">;
  category: Pick<Category, "name" | "slug">;
};

export type ListPostResultT = {
  items: ListPostT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type BuildPostWhereParams = {
  authenticatedUserId?: number;
  search?: string | undefined;
  categorySlug?: string | undefined;
  status?: PostStatus | undefined;
};

export type CreatePostParams = {
  title: string;
  excerpt: string;
  content: string;
  status?: PostStatus;
  categoryId: number | string;
  imageFilename?: string;
  authenticatedUserId?: number;
};

export type UpdatePostParams = {
  title: string;
  excerpt: string;
  content: string;
  status?: PostStatus;
  categoryId: number | string;
  imageFilename?: string;
  authenticatedUserId?: number;
};

export type ParsePostQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  categorySlug?: string | undefined;
  status?: PostStatus | undefined;
};
