import { OrderItemType, OrderPaymentStatus, OrderSource, OrderStatus } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import {
  CreateOrderParams,
  ListOrdersParams,
  UpdateOrderParams,
} from "../../types/order";
import { createError } from "../../utils/common";
import { findUserById } from "../user/user.helpers";
import {
  buildOrderWhere,
  deleteOrderRecord,
  enrichOrder,
  enrichOrders,
  findOrderRecordByCode,
  findOrderWithDetailsByCode,
  generateOrderCode,
  requireOrderCode
} from "./order.helpers";

const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.PENDING],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.ACCEPTED],
  [OrderStatus.DELIVERED]: [OrderStatus.DONE, OrderStatus.SHIPPED],
  [OrderStatus.REJECTED]: [OrderStatus.PENDING],
  [OrderStatus.DONE]: [],
  [OrderStatus.CANCELLED]: [],
};

export const listOrders = async ({
  pageSize,
  offset,
  search,
  status,
  paymentStatus,
  source,
  userId,
}: ListOrdersParams) => {
  const where = buildOrderWhere({
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(source ? { source } : {}),
    ...(userId ? { userId } : {}),
  });

  const total = await prisma.order.count({ where });
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const items = await prisma.order.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { id: "desc" },
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

  return {
    items: await enrichOrders(items),
    currentPage,
    totalPages,
    pageSize,
  };
};

export const getOrderDetail = async (code: string) => {
  const normalizedCode = requireOrderCode(code);
  const order = await findOrderWithDetailsByCode(normalizedCode);

  if (!order) {
    throw createError({
      message: "Order not found",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return await enrichOrder(order);
};

export const createOrder = async (params: CreateOrderParams) => {
  const {
    status,
    customerName,
    customerPhone,
    customerAddress,
    customerNotes,
    rejectedReason,
    cancelledReason,
    items,
    userId,
    authenticatedUserId,
  } = params;

  if (status) {
    const allowedInitialStatuses = [OrderStatus.PENDING, OrderStatus.ACCEPTED];
    if (!allowedInitialStatuses.includes(status as "PENDING" | "ACCEPTED")) {
      throw createError({
        message: "New admin orders can only start as PENDING or ACCEPTED.",
        status: 400,
        code: errorCode.invalid,
      });
    }
  }

  // Validate userId if provided, otherwise use authenticated user
  let orderUserId: number;
  if (userId) {
    const userIdNum = parseInt(String(userId), 10);
    const user = await findUserById(userIdNum);
    if (!user) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }
    orderUserId = userIdNum;
  } else {
    if (!authenticatedUserId) {
      throw createError({
        message: "User ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }
    orderUserId = authenticatedUserId;
  }

  if (!items || items.length === 0) {
    throw createError({
      message: "Order items are required and must contain at least one item.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Calculate total price and verify products
    let calculatedTotalPrice = 0;
    const verifiedItems = [];

    for (const item of items) {
      const itemIdNum = parseInt(String(item.itemId), 10);
      const quantityNum = parseInt(String(item.quantity), 10);

      const variant = await tx.productVariant.findUnique({
        where: { id: itemIdNum }
      });

      if (!variant) {
        throw createError({
          message: `Product variant not found`,
          status: 400,
          code: errorCode.notFound,
        });
      }

      calculatedTotalPrice += Number(variant.price) * quantityNum;
      verifiedItems.push({
        itemId: itemIdNum,
        itemType: item.itemType || OrderItemType.PRODUCT_VARIANT,
        quantity: quantityNum,
        price: variant.price,
      });
    }

    // 2. Create Order record
    const order = await tx.order.create({
      data: {
        code: generateOrderCode(),
        userId: orderUserId,
        totalPrice: calculatedTotalPrice,
        source: OrderSource.ADMIN,
        status: status || OrderStatus.PENDING,
        paymentStatus: OrderPaymentStatus.UNPAID,
        customerName: customerName ? customerName.trim() : null,
        customerPhone: customerPhone ? customerPhone.trim() : null,
        customerAddress: customerAddress ? customerAddress.trim() : null,
        customerNotes: customerNotes ? customerNotes.trim() : null,
        rejectedReason: (status === OrderStatus.REJECTED && rejectedReason) ? rejectedReason.trim() : null,
        cancelledReason: (status === OrderStatus.CANCELLED && cancelledReason) ? cancelledReason.trim() : null,
        orderItems: {
          create: verifiedItems.map(item => ({
            itemId: item.itemId,
            itemType: item.itemType,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { orderItems: true },
    });

    return await enrichOrder(order);
  });
};

export const updateOrder = async (code: string, params: UpdateOrderParams) => {
  const {
    status: newStatus,
    customerName,
    customerPhone,
    customerAddress,
    customerNotes,
    rejectedReason,
    items,
  } = params;

  const existingOrder = await findOrderRecordByCode(code);
  if (!existingOrder) {
    throw createError({
      message: "Order not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  // 1. Validation: Order Status Transition
  if (newStatus !== undefined && newStatus !== existingOrder.status) {
    const allowedTransitions = ORDER_STATUS_FLOW[existingOrder.status as OrderStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus as OrderStatus)) {
      throw createError({
        message: `Status transition from ${existingOrder.status} to ${newStatus} is not allowed.`,
        status: 400,
        code: errorCode.invalid,
      });
    }
  }

  // 2. Validation: Field Locking
  const isLockedStatus = [
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.DONE,
    OrderStatus.CANCELLED,
    OrderStatus.REJECTED,
  ].includes(existingOrder.status as "SHIPPED" | "DELIVERED" | "DONE" | "CANCELLED" | "REJECTED");

  const hasFulfillmentData = 
    customerName !== undefined || 
    customerPhone !== undefined || 
    customerAddress !== undefined || 
    customerNotes !== undefined || 
    items !== undefined;

  // Rule for ADMIN Source: Lock fulfillment fields if status is SHIPPED or higher
  if (existingOrder.source === OrderSource.ADMIN && isLockedStatus && hasFulfillmentData) {
    throw createError({
      message: `Cannot modify order details when status is ${existingOrder.status}.`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Rule for CUSTOMER Source: Always lock fulfillment fields except status/rejectedReason
  if (existingOrder.source === OrderSource.CUSTOMER && hasFulfillmentData) {
    throw createError({
      message: "Admin cannot modify fulfillment details for customer-originated orders.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return await prisma.$transaction(async (tx) => {
    const updateData: any = {};

    if (newStatus !== undefined) updateData.status = newStatus;
    if (customerName !== undefined) updateData.customerName = customerName.trim();
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone.trim();
    if (customerAddress !== undefined) updateData.customerAddress = customerAddress.trim();
    if (customerNotes !== undefined) updateData.customerNotes = customerNotes.trim();
    if (rejectedReason !== undefined) updateData.rejectedReason = rejectedReason.trim();

    const updatedOrder = await tx.order.update({
      where: { id: existingOrder.id },
      data: updateData,
    });

    // Handle Items Update (Only for ADMIN source in PENDING/ACCEPTED)
    if (items !== undefined) {
      let calculatedTotalPrice = 0;
      await tx.orderItem.deleteMany({ where: { orderId: existingOrder.id } });

      for (const item of items) {
        const itemIdNum = parseInt(String(item.itemId), 10);
        const quantityNum = parseInt(String(item.quantity), 10);

        const variant = await tx.productVariant.findUnique({ where: { id: itemIdNum } });
        if (!variant) {
          throw createError({
            message: `Product variant with ID ${item.itemId} not found`,
            status: 400,
            code: errorCode.notFound,
          });
        }
        calculatedTotalPrice += Number(variant.price) * quantityNum;
        await tx.orderItem.create({
          data: {
            orderId: existingOrder.id,
            itemId: itemIdNum,
            itemType: item.itemType || OrderItemType.PRODUCT_VARIANT,
            quantity: quantityNum,
            price: variant.price,
          },
        });
      }

      await tx.order.update({
        where: { id: existingOrder.id },
        data: { totalPrice: calculatedTotalPrice },
      });
    }

    const finalOrder = await tx.order.findUnique({
      where: { id: existingOrder.id },
      include: { orderItems: true }
    });

    return await enrichOrder(finalOrder!);
  });
};

export const deleteOrder = async (code: string) => {
  const normalizedCode = requireOrderCode(code);
  const existing = await findOrderRecordByCode(normalizedCode);
  if (!existing) {
    throw createError({
      message: "Order not found",
      status: 404,
      code: errorCode.notFound,
    });
  }

  await deleteOrderRecord(existing.id);
};
