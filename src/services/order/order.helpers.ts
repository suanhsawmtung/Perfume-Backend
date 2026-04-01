import { OrderItemType, OrderPaymentStatus, OrderSource, OrderStatus, PaymentStatus, Prisma, RefundStatus } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import { generateCode } from "../../lib/unique-key-generator";
import { ParseOrderQueryParamsResult } from "../../types/order";
import { createError } from "../../utils/common";

// export const orderStatusTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
//   PENDING: ["ACCEPTED", "REJECTED"],
//   ACCEPTED: ["DONE", "CANCELLED"],
//   DONE: [],
//   REJECTED: [],
//   CANCELLED: [],
// } as const;

// export const orderPaymentStatusTransitions: Record<OrderPaymentStatus, readonly OrderPaymentStatus[]> = {
//   PENDING: ["UNPAID", "FAILED", "PAID"],
//   UNPAID: ["PENDING", "FAILED"],
//   PAID: ["PARTIALLY_REFUNDED", "REFUNDED"],
//   PARTIALLY_REFUNDED: ["REFUNDED"],
//   FAILED: ["PENDING", "UNPAID"], // allow retry
//   REFUNDED: [],
// } as const;

// interface StatusConfig {
//   allowedPaymentStatus: readonly OrderPaymentStatus[];
//   defaultPaymentStatus: OrderPaymentStatus;
// }

// export const orderStatusConfig: Record<OrderStatus, StatusConfig> = {
//   PENDING: {
//     allowedPaymentStatus: ["PENDING"],
//     defaultPaymentStatus: "PENDING",
//   },
//   ACCEPTED: {
//     allowedPaymentStatus: ["PAID"],
//     defaultPaymentStatus: "PAID",
//   },
//   DONE: {
//     allowedPaymentStatus: ["PAID"],
//     defaultPaymentStatus: "PAID",
//   },
//   REJECTED: {
//     allowedPaymentStatus: ["UNPAID", "FAILED", "PENDING"],
//     defaultPaymentStatus: "PENDING",
//   },
//   CANCELLED: {
//     allowedPaymentStatus: ["PAID", "REFUNDED", "PARTIALLY_REFUNDED"],
//     defaultPaymentStatus: "PAID",
//   },
// } as const;

// Generate unique order code (max 15 characters)
export const generateOrderCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomCode = generateCode(2).toUpperCase(); // 2 bytes = 4 hex chars
  return `${timestamp}${randomCode}`;
};

// Enrich order items with their actual data
export const enrichOrderItems = async (orderItems: any[]) => {
  if (!orderItems || orderItems.length === 0) return orderItems;

  const variantIds = orderItems
    .filter((item) => item.itemType === OrderItemType.PRODUCT_VARIANT)
    .map((item) => item.itemId);

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
        },
      },
    },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  return orderItems.map((item) => {
    if (item.itemType === OrderItemType.PRODUCT_VARIANT) {
      return {
        ...item,
        productVariant: variantMap.get(item.itemId),
      };
    }
    return item;
  });
};

export const enrichOrder = async (order: any) => {
  if (!order) return null;
  if (order.orderItems) {
    order.orderItems = await enrichOrderItems(order.orderItems);
  }

  // // Ensure total fields are present for consistency
  // if (order.totalPaidAmount === undefined) {
  //   const payments = order.payments || [];
  //   order.totalPaidAmount = payments
  //     .filter((p: any) => p.status === PaymentStatus.SUCCESS && !p.deletedAt)
  //     .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  // }

  // if (order.totalRefundAmount === undefined) {
  //   const refunds = order.refunds || [];
  //   order.totalRefundAmount = refunds
  //     .filter((r: any) => r.status === RefundStatus.SUCCESS && !r.deletedAt)
  //     .reduce((sum: number, r: any) => sum + Number(r.amount), 0);
  // }

  return order;
};

export const enrichOrders = async (orders: any[]) => {
  return Promise.all(orders.map((order) => enrichOrder(order)));
};

export const parseOrderQueryParams = (
  query: any
): ParseOrderQueryParamsResult => {
  const pageSizeParam = Number(query.limit);
  const pageSize =
    Number.isNaN(pageSizeParam) || pageSizeParam <= 0
      ? 10
      : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search =
    typeof query.search === "string" && query.search.trim().length > 0
      ? query.search.trim()
      : undefined;

  let status: OrderStatus | undefined;
  if (typeof query.status === "string") {
    const statusValue = query.status.toUpperCase();
    if (Object.values(OrderStatus).includes(statusValue as OrderStatus)) {
      status = statusValue as OrderStatus;
    }
  }

  let paymentStatus: OrderPaymentStatus | undefined;
  if (typeof query.paymentStatus === "string") {
    const paymentStatusValue = query.paymentStatus.toUpperCase();
    if (
      Object.values(OrderPaymentStatus).includes(paymentStatusValue as OrderPaymentStatus)
    ) {
      paymentStatus = paymentStatusValue as OrderPaymentStatus;
    }
  }

  let source: OrderSource | undefined;
  if (typeof query.source === "string") {
    const sourceValue = query.source.toUpperCase();
    if (Object.values(OrderSource).includes(sourceValue as OrderSource)) {
      source = sourceValue as OrderSource;
    }
  }

  let userId: number | undefined;
  if (typeof query.userId === "string") {
    const parsedUserId = Number(query.userId);
    if (!isNaN(parsedUserId) && parsedUserId > 0) {
      userId = parsedUserId;
    }
  }

  return {
    pageSize,
    offset,
    search,
    status,
    paymentStatus,
    source,
    userId,
  };
};

export const buildOrderWhere = (params: {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  source?: OrderSource;
  userId?: number;
}): Prisma.OrderWhereInput => {
  const { search, status, paymentStatus, source, userId } = params;
  const whereConditions: Prisma.OrderWhereInput[] = [{ deletedAt: null }];

  if (search) {
    whereConditions.push({
      OR: [
        { code: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { customerAddress: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  if (status) {
    whereConditions.push({ status });
  }

  if (paymentStatus) {
    whereConditions.push({ paymentStatus });
  }

  if (source) {
    whereConditions.push({ source });
  }

  if (userId) {
    whereConditions.push({ userId });
  }

  return whereConditions.length > 0
    ? {
        AND: whereConditions,
      }
    : {};
};

export const findOrderRecordByCode = async (code: string) => {
  return await prisma.order.findUnique({
    where: { code, deletedAt: null },
  });
};

export const findOrderRecordWithItemsByCode = async (code: string) => {
  return await prisma.order.findUnique({
    where: { code, deletedAt: null },
    include: {
      orderItems: true,
    },
  });
};

export const findOrderWithDetailsByCode = async (code: string) => {
  const order = await prisma.order.findUnique({
    where: { code, deletedAt: null },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          phone: true,
          email: true,
        },
      },
      orderItems: true,
      payments: true,
      refunds: true,
    },
  });

  if (!order) return null;

  const totalPaidAmount = order.payments
    .filter((p) => p.status === PaymentStatus.SUCCESS && !p.deletedAt)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalRefundAmount = order.refunds
    .filter((r) => r.status === RefundStatus.SUCCESS && !r.deletedAt)
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return {
    ...order,
    totalPaidAmount,
    totalRefundAmount,
  };
};

export const insertOrderRecord = async (data: Prisma.OrderCreateInput) => {
  return await prisma.order.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      orderItems: true,
    },
  });
};

export const updateOrderRecord = async (
  id: number,
  data: Prisma.OrderUpdateInput
) => {
  return await prisma.order.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      orderItems: true,
    },
  });
};

export const deleteOrderRecord = async (id: number) => {
  return await prisma.order.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export const createOrderItemRecord = async (data: Prisma.OrderItemCreateManyOrderInput) => {
    // This is useful for nested creation or manual item insertion
    // Actually OrderItem creation is usually part of Order creation or manual loop
};

export const deleteOrderItemRecords = async (orderId: number) => {
  return await prisma.orderItem.deleteMany({
    where: { orderId },
  });
};

export const requireOrderCode = (code: string) => {
  if (!code || code.trim().length === 0) {
    throw createError({
      message: "Order code parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }
  return code.trim();
};

export const reserveInventory = async (
  id: number,
  orderItem: {
    itemType: OrderItemType;
    itemId: number;
    reservedQuantity: number;
  }
) => {
  // await prisma.inventory.update({
  //   where: { id: id },
  //   data: { reserved: { increment: orderItem.reservedQuantity } },
  // });
};

export const calculateOrderPaymentStatus = (
  totalPrice: number,
  totalPaidAmount: number,
  totalRefundAmount: number
): OrderPaymentStatus => {
  if (totalRefundAmount > 0) {
    if (totalRefundAmount >= totalPaidAmount) {
      return OrderPaymentStatus.REFUNDED;
    }
    return OrderPaymentStatus.PARTIALLY_REFUNDED;
  }

  if (totalPaidAmount >= totalPrice) {
    return OrderPaymentStatus.PAID;
  }

  if (totalPaidAmount > 0) {
    return OrderPaymentStatus.PARTIALLY_PAID;
  }

  return OrderPaymentStatus.UNPAID;
};
