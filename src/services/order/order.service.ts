import { InventoryType, OrderItemType, OrderPaymentStatus, OrderSource, OrderStatus, ReservationStatus } from "@prisma/client";
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
  enrichOrder,
  enrichOrders,
  findOrderRecordWithItemsByCode,
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
    orderBy: { createdAt: "desc" },
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
    items,
    userId,
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

  if(!userId){
    throw createError({
      message: "You must be logged in to create an order.",
      status: 401,
      code: errorCode.unauthenticated,
    });
  }

  const orderUserId = parseInt(String(userId), 10);

  const user = await findUserById(orderUserId);
  if (!user) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
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

    const variantIds = items.map(item => Number(item.itemId));

    const variants = await tx.productVariant.findMany({
      where: { id: { in: variantIds } },
    });

    const variantMap = new Map(
      variants.map(v => [v.id, v])
    );

    for (const item of items) {
      const itemIdNum = Number(item.itemId);

      const variant = variantMap.get(itemIdNum);

      if (!variant) {
        throw createError({
          message: `Product variant not found`,
          status: 400,
          code: errorCode.notFound,
        });
      }

      const quantityNum = Number(item.quantity);
      const priceNum = Number(item.price);

      calculatedTotalPrice += priceNum * quantityNum;
      verifiedItems.push({
        itemId: itemIdNum,
        itemType: item.itemType || OrderItemType.PRODUCT_VARIANT,
        quantity: quantityNum,
        price: priceNum,
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

    for(const item of verifiedItems){
      const updated = await tx.productVariant.updateMany({
        where: { 
          id: item.itemId,
          stock: { gte: item.quantity },
        },
        data: {
          reserved: { increment: item.quantity },
        },
      });

      if (updated.count === 0) {
        throw createError({
          message: `Product variant not found or stock is not enough`,
          status: 400,
          code: errorCode.invalid,
        });
      }

      await tx.reservation.create({
        data: {
          productVariantId: item.itemId,
          orderId: order.id,
          quantity: item.quantity,
          status: ReservationStatus.ACTIVE,
        },
      });
    }

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
    cancelledReason,
    items,
  } = params;

  const existingOrder = await findOrderRecordWithItemsByCode(code);
  if (!existingOrder) {
    throw createError({
      message: "Order not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const isStatusChanged = newStatus !== undefined && newStatus !== existingOrder.status;

  // 1. Validation: Order Status Transition
  if (isStatusChanged) {
    const allowedTransitions = ORDER_STATUS_FLOW[existingOrder.status as OrderStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus as OrderStatus)) {
      throw createError({
        message: `Status transition from ${existingOrder.status} to ${newStatus} is not allowed.`,
        status: 400,
        code: errorCode.invalid,
      });
    }

    if (existingOrder.source === OrderSource.CUSTOMER && newStatus === OrderStatus.CANCELLED) {
      throw createError({
        message: "You cannot cancel the customer sourced order.",
        status: 400,
        code: errorCode.invalid,
      });
    }
  }

  if (newStatus === OrderStatus.REJECTED && !rejectedReason?.trim()) {
    throw createError({
      message: "Rejected reason is required when status is REJECTED.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (newStatus === OrderStatus.CANCELLED && !cancelledReason?.trim()) {
    throw createError({
      message: "Cancelled reason is required when status is CANCELLED.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  // 2. Validation: Field Locking
  const isLockedStatus = [
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.DONE,
    OrderStatus.CANCELLED,
    OrderStatus.REJECTED,
  ].includes(existingOrder.status as "SHIPPED" | "DELIVERED" | "DONE" | "CANCELLED" | "REJECTED");

  const isNameChanged = customerName !== undefined && customerName.trim() !== (existingOrder.customerName || "");
  const isPhoneChanged = customerPhone !== undefined && customerPhone.trim() !== (existingOrder.customerPhone || "");
  const isAddressChanged = customerAddress !== undefined && customerAddress.trim() !== (existingOrder.customerAddress || "");
  const isNotesChanged = customerNotes !== undefined && (customerNotes?.trim() || "") !== (existingOrder.customerNotes || "");
  const initialItems = existingOrder.orderItems || [];
  const isItemsChanged = items !== undefined && (
    items.length !== initialItems.length ||
    items.some((item, index) => {
      const original = initialItems[index];
      return (
        !original ||
        item.itemId !== original.itemId ||
        item.itemType !== original.itemType ||
        item.quantity !== original.quantity ||
        Number(item.price) !== Number(original.price)
      );
    })
  );

  const hasActualFulfillmentChanges = 
    isNameChanged || 
    isPhoneChanged || 
    isAddressChanged || 
    isNotesChanged || 
    isItemsChanged;

  // Rule for ADMIN Source: Lock fulfillment fields if status is SHIPPED or higher
  if (existingOrder.source === OrderSource.ADMIN && isLockedStatus && hasActualFulfillmentChanges) {
    throw createError({
      message: `Cannot modify order details when status is ${existingOrder.status}.`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Rule for CUSTOMER Source: Always lock fulfillment fields except status/rejectedReason
  if (existingOrder.source === OrderSource.CUSTOMER && hasActualFulfillmentChanges) {
    throw createError({
      message: "Admin cannot modify fulfillment details for customer-originated orders.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return await prisma.$transaction(async (tx) => {
    const updateData: any = {};

    if (isStatusChanged) updateData.status = newStatus;
    if (isNameChanged) updateData.customerName = customerName!.trim();
    if (isPhoneChanged) updateData.customerPhone = customerPhone!.trim();
    if (isAddressChanged) updateData.customerAddress = customerAddress!.trim();
    if (isNotesChanged) updateData.customerNotes = customerNotes!.trim();
    if (rejectedReason !== undefined) updateData.rejectedReason = rejectedReason.trim();
    if (cancelledReason !== undefined) updateData.cancelledReason = cancelledReason.trim();

    await tx.order.update({
      where: { id: existingOrder.id },
      data: updateData,
    });

    // Handle Items Update (Only for ADMIN source in PENDING/ACCEPTED)
    if (isItemsChanged) {
      const orderReservations = await tx.reservation.findMany({
        where: { 
          orderId: existingOrder.id,
          status: ReservationStatus.ACTIVE,
        },
      });

      for(const reservation of orderReservations){
        await tx.productVariant.update({
          where: { id: reservation.productVariantId },
          data: { reserved: { decrement: reservation.quantity } },
        });
      }
      
      await tx.reservation.deleteMany({ 
        where: { 
          orderId: existingOrder.id, 
          status: ReservationStatus.ACTIVE 
        } 
      });

      await tx.orderItem.deleteMany({ where: { orderId: existingOrder.id } });

      let calculatedTotalPrice = 0;

      const variantIds = items.map(item => Number(item.itemId));

      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
      });

      const variantMap = new Map(
        variants.map(v => [v.id, v])
      );

      for (const item of items) {
        const itemIdNum = Number(item.itemId);

        const variant = variantMap.get(itemIdNum);
        if (!variant) {
          throw createError({
            message: `Product variant with ID ${item.itemId} not found`,
            status: 400,
            code: errorCode.notFound,
          });
        }

        const quantityNum = Number(item.quantity);
        const priceNum = Number(item.price);

        calculatedTotalPrice += priceNum * quantityNum;

        const updated = await tx.productVariant.updateMany({
          where: { 
            id: itemIdNum,
            stock: { gte: quantityNum },
          },
          data: { reserved: { increment: quantityNum } },
        });

        if (updated.count === 0) {
          throw createError({
            message: `Product variant not found or stock is not enough`,
            status: 400,
            code: errorCode.invalid,
          });
        }

        await tx.reservation.create({
          data: {
            productVariantId: itemIdNum,
            orderId: existingOrder.id,
            quantity: quantityNum,
            status: ReservationStatus.ACTIVE,
          },
        });

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

    if(isStatusChanged){
      // Scenario 1: DONE - Consume reservations
      if(newStatus === OrderStatus.DONE){
        const activeReservations = await tx.reservation.findMany({
          where: { 
            orderId: existingOrder.id,
            status: ReservationStatus.ACTIVE,
          },
        });

        const variantIds = activeReservations.map(r => r.productVariantId);

        const variants = await tx.productVariant.findMany({
          where: { id: { in: variantIds } },
        });

        const variantMap = new Map(
          variants.map(v => [v.id, v])
        );

        for(const reservation of activeReservations){
          const variant = variantMap.get(reservation.productVariantId);

          if (!variant || variant.stock <= 0) {
            throw createError({
              message: "Invalid product state",
              status: 400,
              code: errorCode.invalid,
            });
          }

          const avgCost = Number(variant.totalCost) / parseInt(String(variant.stock), 10);

          const cost = avgCost * parseInt(String(reservation.quantity), 10);

          const updatedVariant = await tx.productVariant.updateMany({
            where: {
              id: reservation.productVariantId,
              stock: { gte: reservation.quantity },
              reserved: { gte: reservation.quantity },
            },
            data: { 
              stock: { decrement: reservation.quantity },
              reserved: { decrement: reservation.quantity },
              totalCost: { decrement: cost },
            },
          });

          if (updatedVariant.count === 0) {
            throw createError({
              message: `Stock mismatch`,
              status: 400,
              code: errorCode.invalid,
            });
          }

          await tx.inventory.create({
            data: {
              productVariantId: reservation.productVariantId,
              type: InventoryType.SALE,
              quantity: reservation.quantity,
              unitCost: avgCost,
              totalCost: cost,
              createdById: existingOrder.userId,
            },
          });
        }

        await tx.reservation.updateMany({
          where: { 
            orderId: existingOrder.id,
            status: ReservationStatus.ACTIVE,
          },
          data: { status: ReservationStatus.CONSUMED },
        });

      }
      // Scenario 2: REJECTED or CANCELLED - Release reservations
      else if(newStatus === OrderStatus.REJECTED || newStatus === OrderStatus.CANCELLED){
        const activeReservations = await tx.reservation.findMany({
          where: { 
            orderId: existingOrder.id,
            status: ReservationStatus.ACTIVE,
          },
        });

        await tx.reservation.updateMany({
          where: { 
            orderId: existingOrder.id,
            status: ReservationStatus.ACTIVE,
          },
          data: { status: ReservationStatus.RELEASED },
        });

        for(const reservation of activeReservations){
          await tx.productVariant.update({
            where: { id: reservation.productVariantId },
            data: { 
              reserved: { decrement: reservation.quantity } 
            },
          });
        }
      }
      // Scenario 3: REJECTED -> PENDING - Re-activate released reservations
      else if(existingOrder.status === OrderStatus.REJECTED && newStatus === OrderStatus.PENDING){
        const releasedReservations = await tx.reservation.findMany({
          where: { 
            orderId: existingOrder.id,
            status: ReservationStatus.RELEASED,
          },
        });

        for(const reservation of releasedReservations){
          // Verify stock before re-activating (Pattern consistent with order creation)
          const updated = await tx.productVariant.updateMany({
            where: { 
              id: reservation.productVariantId,
              stock: { gte: reservation.quantity },
            },
            data: {
              reserved: { increment: reservation.quantity },
            },
          });

          if (updated.count === 0) {
            throw createError({
              message: `Cannot return order to PENDING. Product variant stock is no longer sufficient.`,
              status: 400,
              code: errorCode.invalid,
            });
          }

          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: ReservationStatus.ACTIVE },
          });
        }
      }
    }

    const finalOrder = await tx.order.findUnique({
      where: { id: existingOrder.id },
      include: { orderItems: true }
    });

    return await enrichOrder(finalOrder!);
  });
};
