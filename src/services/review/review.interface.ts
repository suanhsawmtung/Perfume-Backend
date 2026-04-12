import { Review } from "@prisma/client";
import { ServiceResponseT } from "../../types/common";
import {
  ListReviewResultT,
  ListReviewsParams,
  ListReviewT,
} from "../../types/review";

export interface IAdminReviewService {
  listReviews(params: ListReviewsParams): Promise<ServiceResponseT<ListReviewResultT>>;
  getReviewDetail(id: number): Promise<ServiceResponseT<ListReviewT>>;
  togglePublishing(id: number): Promise<ServiceResponseT<Review>>;
}
