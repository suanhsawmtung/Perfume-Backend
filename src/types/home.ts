import { ListPostT } from "./post";
import { ListProductT } from "./product";
import { ListReviewT } from "./review";

export type HomeDataT = {
  bestSellerProducts: ListProductT[];
  productsForYou: ListProductT[];
  latestReviews: ListReviewT[];
  latestPosts: ListPostT[];
};
