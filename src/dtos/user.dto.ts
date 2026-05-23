import { getGradeInfo } from "../services/user/user.helpers";
import { MyProfileT, UserProfileQueryData } from "../types/user";

export class UserDto {
  static toMyProfile(
    user: UserProfileQueryData,
    stats: { totalOrders: number; totalSpent: number; totalReviews: number }
  ): MyProfileT {
    const points = user.points;
    const gradeInfo = getGradeInfo(points);
    const rangeSize = gradeInfo.end - gradeInfo.start;
    const progress =
      rangeSize > 0
        ? Math.min(
          100,
          Math.max(0, ((points - gradeInfo.start) / rangeSize) * 100)
        )
        : 100;

    const rewards = {
      currentPoints: points,
      currentGrade: gradeInfo.grade,
      progress: Math.round(progress),
      range: { start: gradeInfo.start, end: gradeInfo.end },
      toNextGrade: Math.max(0, gradeInfo.end - points),
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      totalReviews: stats.totalReviews,
    };

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      username: user.username,
      phone: user.phone,
      image: user.image,
      orders: user.orders.map((order) => ({
        id: order.id,
        code: order.code,
        createdAt: order.createdAt,
        totalPrice: Number(order.totalPrice),
        totalQuantity: order.orderItems.reduce(
          (acc, item) => acc + item.quantity,
          0
        ),
      })),
      wishlist: user.wishlists.map((item) => {
        const product = item.product;
        const primaryVariant = product.variants[0];
        return {
          id: product.id,
          name: product.name,
          image: primaryVariant?.images[0]?.path || null,
          price: Number(primaryVariant?.price || 0),
          discount: Number(primaryVariant?.discount || 0),
        };
      }),
      reviews: user.reviews.map((review) => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        isPublish: review.isPublish,
        createdAt: review.createdAt,
        productName: review.product.name,
      })),
      rewards,
    };
  }
}
