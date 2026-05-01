import { CursorPaginationParams, ServiceResponseT } from "../../types/common";
import { MyWishlistResultT, ToggleWishlistResponseT } from "../../types/wishlist";

export interface IWishlistService {
  listMyWishlist(userId: number, params: CursorPaginationParams): Promise<ServiceResponseT<MyWishlistResultT>>;
  toggleWishlist(
    userId: number,
    productId: number
  ): Promise<ServiceResponseT<ToggleWishlistResponseT>>;
}
