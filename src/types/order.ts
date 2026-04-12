import { Brand, Order, OrderItem, OrderItemType, OrderPaymentStatus, OrderSource, OrderStatus, Product, ProductVariant, User } from "@prisma/client";

export type ListOrdersParams = {
  limit?: number | string;
  offset?: number | string;
  search?: string | undefined;
  status?: OrderStatus | undefined;
  paymentStatus?: OrderPaymentStatus | undefined;
  source?: OrderSource | undefined;
  userId?: number | undefined;
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

export type ListOrderResultT = {
  items: ListOrderT[];
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
    itemType: OrderItemType;
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
    itemType: OrderItemType;
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
};
