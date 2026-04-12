import { ServiceResponseT } from "../../types/common";
import {
  ListProductRatingResultT,
  ListProductRatingSummaryResultT,
  ListProductRatingsParams
} from "../../types/product-rating";

export interface IAdminRatingService {
  listRatings(params: ListProductRatingsParams): Promise<ServiceResponseT<ListProductRatingResultT>>;
  listProductRatingSummary(params: ListProductRatingsParams): Promise<ServiceResponseT<ListProductRatingSummaryResultT>>;
}
