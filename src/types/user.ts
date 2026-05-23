import { Image, Order, OrderItem, Product, ProductVariant, ProductWishlist, Review, Role, Status, User } from "@prisma/client";

export type SafeUserT = Omit<
  User,
  "password" | 
  "refreshToken" | 
  "previousRefreshToken" | 
  "googleId" | 
  "rotateTokenAt" | 
  "deletedAt"
>;

export type ListUsersParams = {
  limit?: number | string | undefined;
  offset?: number | string | undefined;
  authenticatedUserId?: number | undefined;
  search?: string | undefined;
  role?: Role | undefined;
  status?: Status | undefined;
};

export type BuildUserWhereParams = Omit<ListUsersParams, "limit" | "offset">;

export type CreateUserParams = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email: string;
  role: Role;
  status: Status;
};

export type UpdateUserParams = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email: string;
  role: Role;
  status: Status;
};

export type UpdateUserRoleParams = {
  role: Role;
};

export type UpdateUserStatusParams = {
  status: Status;
};

export type UpdateMeParams = {
  firstName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  imageFilename?: string | undefined;
};

export type ChangePasswordParams = {
  oldPassword: string;
  newPassword: string;
};

export type SetPasswordParams = {
  newPassword: string;
};

export type ParseUserQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  role?: Role | undefined;
  status?: Status | undefined;
};

export type ListUserResultT = {
  items: SafeUserT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type PublicUserT = Pick<User, "id" | "firstName" | "lastName" | "username">;

export type PublicUserResultT = {
  items: PublicUserT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type UserProfileQueryData = Pick<
  SafeUserT,
  "points" | "id" | "firstName" | "lastName" | "email" | "phone" | "emailVerifiedAt" | "createdAt" | "username" | "image"
> & {
  orders: (Pick<Order, "id" | "code" | "createdAt" | "totalPrice"> & {
    orderItems: Pick<OrderItem, "quantity">[];
  })[];
  wishlists: (Pick<ProductWishlist, "id"> & {
    product: Pick<Product, "id" | "name"> & {
      variants: (Pick<ProductVariant, "price" | "discount"> & {
        images: Pick<Image, "path">[];
      })[];
    };
  })[];
  reviews: (Pick<Review, "id" | "content" | "rating" | "isPublish" | "createdAt"> & {
    product: Pick<Product, "name">;
  })[];
};

export type MyProfileT = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  username: string;
  phone: string | null;
  image: string | null;
  orders: {
    id: number;
    code: string;
    createdAt: Date;
    totalPrice: number;
    totalQuantity: number;
  }[];
  wishlist: {
    id: number;
    name: string;
    image: string | null;
    price: number;
    discount: number;
  }[];
  reviews: {
    id: number;
    content: string | null;
    rating: number;
    isPublish: boolean;
    createdAt: Date;
    productName: string;
  }[];
  rewards: {
    currentPoints: number;
    currentGrade: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE";
    progress: number;
    range: { start: number; end: number };
    toNextGrade: number;
    totalOrders: number;
    totalSpent: number;
    totalReviews: number;
  };
};
