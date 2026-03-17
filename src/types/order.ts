import { OrderItemType, OrderPaymentStatus, OrderSource, OrderStatus } from "@prisma/client";

export type ListOrdersParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  status?: OrderStatus | undefined;
  paymentStatus?: OrderPaymentStatus | undefined;
  source?: OrderSource | undefined;
  userId?: number | undefined;
};

export type CreateOrderParams = {
  totalPrice?: number | string;
  source?: OrderSource;
  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
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
  userId?: number | string;
  authenticatedUserId?: number;
  image?: string | undefined;
};

export type UpdateOrderParams = {
  totalPrice?: number | string;
  source?: OrderSource;
  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
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
  userId?: number | string;
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
