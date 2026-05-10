import { ListPostT } from "./post";
import { ProductCardT } from "./product";
import { ListReviewT } from "./review";

export type HomeDataT = {
  bestSellerProducts: ProductCardT[];
  productsForYou: ProductCardT[];
  latestReviews: ListReviewT[];
  latestPosts: ListPostT[];
};
