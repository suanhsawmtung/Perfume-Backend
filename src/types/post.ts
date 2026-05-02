import { Category, Post, PostStatus, User } from "@prisma/client";

export type ListPostsParams = {
  limit?: number | string;
  offset?: number | string;
  authenticatedUserId?: number;
  search?: string | undefined;
  categorySlug?: string | undefined;
  status?: PostStatus | undefined;
};

export type AdminListPostT = Pick<
  Post,
  "id" | "title" | "slug" | "status" | "publishedAt"
> & {
  author: Pick<User, "id" | "firstName" | "lastName" | "username">;
  category: Pick<Category, "id" | "name" | "slug">;
};

export type AdminListPostResultT = {
  items: AdminListPostT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type ListPostT = Pick<
  Post,
  "id" | "title" | "slug" | "excerpt" | "publishedAt"
> & {
  author: Pick<User, "id" | "firstName" | "lastName" | "username">;
  category: Pick<Category, "id" | "name" | "slug">;
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

export type PostDetailT = Post & {
  author: Pick<User, "id" | "firstName" | "lastName" | "username" | "email" | "phone">;
  category: Category;
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
