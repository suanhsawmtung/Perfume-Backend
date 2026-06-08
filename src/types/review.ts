import { Product, Review, User } from "@prisma/client";
import { CursorPaginationResultT } from "./common";

export type ListReviewsParams = {
  limit?: number | string;
  offset?: number | string;
  cursor?: number | string;
  search?: string | undefined;
  isPublish?: boolean | undefined;
  username?: string | undefined;
  productSlug?: string | undefined;
};

export type ListReviewT = Review & {
  user: Pick<User, "id" | "firstName" | "lastName" | "username" | "email" | "image">;
  product: Pick<Product, "id" | "name" | "slug">;
};

export type ListReviewResultT = {
  items: ListReviewT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type ProductReviewT = Review & {
  user: Pick<User, "id" | "firstName" | "lastName" | "username" | "email" | "image">;
};

export type BuildReviewWhereParams = {
  search?: string | undefined;
  isPublish?: boolean | undefined;
  username?: string | undefined;
  productSlug?: string | undefined;
};

export type CreateReviewParams = {
  userId: number;
  productId: number;
  rating: number;
  content?: string;
};

export type UpdateReviewParams = {
  rating: number;
  content?: string;
};

export type ParseReviewQueryParamsResult = {
  pageSize: number;
  offset: number;
  cursor: number | undefined;
  search?: string | undefined;
  isPublish?: boolean | undefined;
  username?: string | undefined;
  productSlug?: string | undefined;
};

export type ReviewCardQueryData = Review & {
  product: Pick<Product, "id" | "name" | "slug"> & {
    variants: {
      images: {
        path: string;
      }[];
    }[];
  } & { brand: { name: string } };
};

export type ReviewCardT = Review & {
  product: {
    id: number;
    name: string;
    slug: string;
    brand: string;
    image: string | null;
  }
}

export type MyReviewsResultT = CursorPaginationResultT<ReviewCardT>;
