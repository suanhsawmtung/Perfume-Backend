import { Brand, Order, OrderItem, OrderPaymentStatus, OrderSource, OrderStatus, Product, ProductVariant, User } from "@prisma/client";

export type ListOrdersParams = {
  limit?: number | string;
  offset?: number | string;
  search?: string | undefined;
  status?: OrderStatus | undefined;
  paymentStatus?: OrderPaymentStatus | undefined;
  source?: OrderSource | undefined;
  userId?: number | undefined;
  condition?: "all" | "active" | "inactive" | undefined;
};

export type ListOrderT = Order & {
  user: Pick<User, "id" | "firstName" | "lastName" | "username" | "phone" | "email">;
  orderItems?: (OrderItem & {
    productVariant?: ProductVariant & {
      product: Pick<Product, "id" | "name" | "slug"> & { brand: Brand };
    };
  })[];
  totalPaidAmount?: number;
  totalRefundAmount?: number;
};

export type ListOrderResultT<T = ListOrderT> = {
  items: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type CreateOrderParams = {
  totalPrice?: number | string;
  status?: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNotes?: string;
  items?: Array<{
    itemId: number | string;
    quantity: number | string;
    price: number | string;
  }>;
  userId?: number | string;
};

export type UpdateOrderParams = {
  totalPrice?: number | string;
  source?: OrderSource;
  status?: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNotes?: string;
  rejectedReason?: string;
  cancelledReason?: string;
  items?: Array<{
    itemId: number | string;
    quantity: number | string;
    price: number | string;
  }>;
  products?: Array<{
    productId: number | string;
    quantity: number | string;
    price: number | string;
  }>;
  image?: string | undefined;
};

export type ParseOrderQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  status?: OrderStatus | undefined;
  paymentStatus?: OrderPaymentStatus | undefined;
  source?: OrderSource | undefined;
  userId?: number | undefined;
  condition?: "all" | "active" | "inactive" | undefined;
};

export type OrderCardQueryDataT = Pick<
  Order,
  "id" |
  "code" |
  "image" |
  "status" |
  "paymentStatus" |
  "createdAt" |
  "totalPrice" |
  "customerAddress" |
  "customerName" |
  "customerPhone" |
  "customerNotes" |
  "cancelledReason" |
  "rejectedReason"
> & {
  orderItems: (Pick<OrderItem, "quantity" | "price"> & {
    productVariant: Pick<ProductVariant, "size"> & {
      images: { path: string }[];
      product: Pick<Product, "id" | "name" | "slug"> & {
        brand: Pick<Brand, "name">;
      };
    };
  })[];
  totalPaidAmount?: number;
  totalRefundAmount?: number;
};

export type MyOrderT = Omit<
  OrderCardQueryDataT,
  "orderItems"
> & {
  orderItems: (Pick<OrderItem, "quantity" | "price"> & {
    size: number;
    image: string | null;
    product: {
      id: number;
      slug: string;
      name: string;
      brand: string;
    }
  })[];
};

export type MyOrderListResultT = {
  items: MyOrderT[];
  nextCursor: number | null;
};
