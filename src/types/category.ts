import { Category } from "@prisma/client";

export type ListCategoriesParams = {
  pageSize?: number;
  offset?: number;
  search?: string | undefined;
};

export type CreateCategoryParams = {
  name: string;
};

export type UpdateCategoryParams = {
  name: string;
};

export type ParseCategoryQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
};

export type ListPublicCategoryT = {
  id: number;
  name: string;
  slug: string;
};

export type ListCategoryT = Category & {
  _count: {
    posts: number;
  };
};

export type ListCategoryResultT = {
  items: ListCategoryT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};
