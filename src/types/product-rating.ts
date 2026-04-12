import { Brand, Product, ProductRating, User } from "@prisma/client";

export type ListProductRatingsParams = {
  limit?: number | string;
  offset?: number | string;
  search?: string | undefined;
  productSlug?: string | undefined;
  username?: string | undefined;
};

export type ListProductRatingT = ProductRating & {
  user: Pick<User, "username">;
  product: Pick<Product, "id" | "name" | "slug"> & {
    brand: Pick<Brand, "name">;
  };
};

export type ListProductRatingResultT = {
  items: ListProductRatingT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type ListProductRatingSummaryT = {
  id: number;
  name: string;
  slug: string;
  rating: number;
  ratingCount: number;
  brand: {
    name: string;
  };
};

export type ListProductRatingSummaryResultT = {
  items: ListProductRatingSummaryT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type ParseProductRatingQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  product?: string | undefined;
  user?: string | undefined;
};
