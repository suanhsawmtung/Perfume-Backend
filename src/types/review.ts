import { Review, User, Product } from "@prisma/client";

export type ListReviewsParams = {
  limit?: number | string;
  offset?: number | string;
  search?: string | undefined;
  isPublish?: boolean | undefined;
  username?: string | undefined;
  productSlug?: string | undefined;
};

export type ListReviewT = Review & {
  user: Pick<User, "username">;
  product: Pick<Product, "name" | "slug">;
};

export type ListReviewResultT = {
  items: ListReviewT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type BuildReviewWhereParams = {
  search?: string | undefined;
  isPublish?: boolean | undefined;
  username?: string | undefined;
  productSlug?: string | undefined;
};

export type ParseReviewQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  isPublish?: boolean | undefined;
  username?: string | undefined;
  productSlug?: string | undefined;
};
