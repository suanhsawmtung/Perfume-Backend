import { Review } from "@prisma/client";
import { CursorPaginationParams, ServiceResponseT } from "../../types/common";
import {
  ListReviewResultT,
  ListReviewsParams,
  ListReviewT,
  ProductReviewT,
  CreateReviewParams,
  UpdateReviewParams,
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
  createReview(params: CreateReviewParams): Promise<ServiceResponseT<Review>>;
  updateReview(id: number, userId: number, params: UpdateReviewParams): Promise<ServiceResponseT<Review>>;
  deleteReview(id: number, userId: number): Promise<ServiceResponseT<null>>;
}
