import { CursorPaginationParams, ServiceResponseT } from "../../types/common";
import { MyWishlistResultT, ToggleWishlistResponseT } from "../../types/wishlist";

export interface IWishlistService {
  listMyWishlist(userId: number, params: CursorPaginationParams): Promise<ServiceResponseT<MyWishlistResultT>>;
  addToWishlist({
    userId,
    productId
  }: {
    userId: number;
    productId: number;
  }): Promise<ServiceResponseT<ToggleWishlistResponseT>>;
  removeFromWishlist({
    userId,
    productId
  }: {
    userId: number;
    productId: number;
  }): Promise<ServiceResponseT<ToggleWishlistResponseT>>;
}
