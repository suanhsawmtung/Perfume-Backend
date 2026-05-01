import { Review } from "@prisma/client";
import { CursorPaginationParams, ServiceResponseT } from "../../types/common";
import {
  ListReviewResultT,
  ListReviewsParams,
  ListReviewT,
  ProductReviewT,
  MyReviewT,
  CreateReviewParams,
  MyReviewsResultT,
} from "../../types/review";

export interface IAdminReviewService {
  listReviews(params: ListReviewsParams): Promise<ServiceResponseT<ListReviewResultT>>;
  getReviewDetail(id: number): Promise<ServiceResponseT<ListReviewT>>;
  togglePublishing(id: number): Promise<ServiceResponseT<Review>>;
}

export interface IReviewService {
  listProductReviews(productSlug: string): Promise<ServiceResponseT<ProductReviewT[]>>;
  getReviewDetail(id: number): Promise<ServiceResponseT<ProductReviewT>>;
  listMyReviews(userId: number, params: CursorPaginationParams): Promise<ServiceResponseT<MyReviewsResultT>>;
  upsertReview(params: CreateReviewParams): Promise<ServiceResponseT<Review>>;
}
