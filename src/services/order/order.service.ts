import { OrderItemType, OrderPaymentStatus, OrderSource, OrderStatus } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import {
  CreateOrderParams,
  ListOrdersParams,
  UpdateOrderParams,
} from "../../types/order";
import { createError } from "../../utils/common";
import { findUserById, getRoleOrThrow } from "../user/user.helpers";
import {
  assertOrderSourceAllowed,
  buildOrderWhere,
  deleteOrderRecord,
  enrichOrder,
  enrichOrders,
  findOrderRecordByCode,
  generateOrderCode,
  orderStatusConfig,
  orderStatusTransitions,
  paymentStatusTransitions,
  requireOrderCode
} from "./order.helpers";

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
  const order = await findOrderRecordByCode(normalizedCode);

  if (!order) {
    throw createError({
      message: "Order not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  // if (authenticatedUserId) {
  //   const role = await getRoleOrThrow(authenticatedUserId);
  //   assertOrderSourceAllowed(order.source, role);
  // }

  return await enrichOrder(order);
};

export const createOrder = async (params: CreateOrderParams) => {
  const {
    status,
    paymentStatus,
    customerName,
    customerPhone,
    customerAddress,
    customerNotes,
    rejectedReason,
    cancelledReason,
    products,
    items,
    userId,
    authenticatedUserId,
    source,
    image,
  } = params;

  const role = authenticatedUserId ? await getRoleOrThrow(authenticatedUserId) : null;
  const effectiveSource = source || OrderSource.CUSTOMER;

  if (role) {
    assertOrderSourceAllowed(effectiveSource, role);
  }

  const orderItemsData =
    items ||
    (products && Array.isArray(products)
      ? products.map((p) => ({
          itemId: p.productId,
          itemType: OrderItemType.PRODUCT_VARIANT,
          quantity: p.quantity,
          price: p.price,
        }))
      : []);

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

  if (orderItemsData.length === 0) {
    throw createError({
      message: "Order items array is required and must contain at least one item.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (status === OrderStatus.REJECTED && (!rejectedReason || rejectedReason.trim().length === 0)) {
    throw createError({
      message: "Rejected reason is required when status is REJECTED.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (status === OrderStatus.CANCELLED && (!cancelledReason || cancelledReason.trim().length === 0)) {
    throw createError({
      message: "Cancelled reason is required when status is CANCELLED.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Calculate total price
  const calculatedTotalPrice = orderItemsData.reduce((acc, item) => {
    return acc + parseFloat(String(item.price)) * parseInt(String(item.quantity), 10);
  }, 0);

  return await prisma.$transaction(async (tx) => {
    // Generate unique order code
    let orderCode = generateOrderCode();
    let codeExists = await tx.order.findUnique({ where: { code: orderCode } });
    while (codeExists) {
      orderCode = generateOrderCode();
      codeExists = await tx.order.findUnique({ where: { code: orderCode } });
    }

    const order = await tx.order.create({
      data: {
        code: orderCode,
        totalPrice: calculatedTotalPrice,
        source: effectiveSource,
        status: status || OrderStatus.PENDING,
        paymentStatus: paymentStatus || OrderPaymentStatus.UNPAID,
        customerName: customerName ? customerName.trim() : null,
        customerPhone: customerPhone ? customerPhone.trim() : null,
        customerAddress: customerAddress ? customerAddress.trim() : null,
        customerNotes: customerNotes ? customerNotes.trim() : null,
        rejectedReason: rejectedReason && status === OrderStatus.REJECTED ? rejectedReason.trim() : null,
        cancelledReason: cancelledReason && status === OrderStatus.CANCELLED ? cancelledReason.trim() : null,
        image: image || null,
        user: {
          connect: { id: orderUserId },
        },
        orderItems: {
          create: orderItemsData.map((item) => ({
            itemId: parseInt(String(item.itemId), 10),
            itemType: item.itemType || OrderItemType.PRODUCT_VARIANT,
            quantity: parseInt(String(item.quantity), 10),
            price: parseFloat(String(item.price)),
          })),
        },
      },
      include: { orderItems: true },
    });

    const orderStatus = order.status;
    if (orderStatus !== OrderStatus.CANCELLED && orderStatus !== OrderStatus.REJECTED) {
      for (const item of orderItemsData) {
        const itemId = parseInt(String(item.itemId), 10);
        const quantity = parseInt(String(item.quantity), 10);

        // Decrement main variant stock
        const variant = await tx.productVariant.update({
          where: { id: itemId },
          data: { stock: { decrement: quantity } },
        });

        // Find or create inventory and reserve
        let inventory = await tx.inventory.findFirst({
          where: { productVariantId: itemId },
        });

        if (!inventory) {
          inventory = await tx.inventory.create({
            data: {
              productVariantId: itemId,
              quantity: variant.stock + quantity, // Initial total quantity
              reserved: quantity,
            },
          });
        } else {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { reserved: { increment: quantity } },
          });
        }

        // Special case for DONE status at creation (unlikely but theoretically possible)
        if (orderStatus === OrderStatus.DONE) {
            await tx.inventory.update({
                where: { id: inventory.id },
                data: {
                    reserved: { decrement: quantity },
                    quantity: { decrement: quantity },
                }
            })
        }
      }
    }

    return await enrichOrder(order);
  });
};

export const updateOrder = async (code: string, params: UpdateOrderParams) => {
  const {
    status: newStatus,
    paymentStatus: newPaymentStatus,
    customerName,
    customerPhone,
    customerAddress,
    customerNotes,
    rejectedReason,
    cancelledReason,
    products,
    items,
    userId,
    image,
  } = params;

  const normalizedCode = requireOrderCode(code);
  const existingOrder = await prisma.order.findUnique({
    where: { code: normalizedCode, deletedAt: null },
    include: { orderItems: true },
  });

  if (!existingOrder) {
    throw createError({
      message: "Order not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  // --- Unified Validation Logic (Mirror Frontend) ---
  const isCustomerOrder = existingOrder.source === OrderSource.CUSTOMER;
  const canUpdate = !isCustomerOrder && existingOrder.status === OrderStatus.PENDING;

  const orderItemsData =
    items ||
    (products && Array.isArray(products)
      ? products.map((p) => ({
          itemId: p.productId,
          itemType: OrderItemType.PRODUCT_VARIANT,
          quantity: p.quantity,
          price: p.price,
        }))
      : undefined);

  if (!canUpdate) {
    const isNameChanged = customerName !== undefined && customerName.trim() !== existingOrder.customerName?.trim();
    const isPhoneChanged = customerPhone !== undefined && customerPhone.trim() !== existingOrder.customerPhone?.trim();
    const isAddressChanged = customerAddress !== undefined && customerAddress.trim() !== existingOrder.customerAddress?.trim();
    const isNotesChanged = customerNotes !== undefined && (customerNotes?.trim() || "") !== (existingOrder.customerNotes || "");
    const isUserIdChanged = userId !== undefined && parseInt(String(userId), 10) !== existingOrder.userId;
    const isSourceChanged = (params as any).source !== undefined && (params as any).source !== existingOrder.source;
    const isImageChanged = image !== undefined && image !== existingOrder.image;
    
    if (
      isNameChanged ||
      isPhoneChanged ||
      isAddressChanged ||
      isNotesChanged ||
      isUserIdChanged ||
      isSourceChanged ||
      isImageChanged
    ) {
      if (isCustomerOrder) {
        throw createError({
          message: "Cannot update customer details or items for orders from CUSTOMER source.",
          status: 403,
          code: errorCode.notAllowed,
        });
      } else {
        throw createError({
          message: "Cannot update order details or items for orders that are not in PENDING status.",
          status: 403,
          code: errorCode.notAllowed,
        });
      }
    }
  }

  // Validation: Order Status Transition
  if (newStatus !== undefined && newStatus !== existingOrder.status) {
    const allowedTransitions = orderStatusTransitions[existingOrder.status as OrderStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus as OrderStatus)) {
      throw createError({
        message: `Status transition from ${existingOrder.status} to ${newStatus} is not allowed.`,
        status: 400,
        code: errorCode.invalid,
      });
    }
  }

  // Validation: Payment Status Compatibility
  const effectiveStatus = (newStatus || existingOrder.status) as OrderStatus;
  const effectivePaymentStatus = (newPaymentStatus || existingOrder.paymentStatus) as OrderPaymentStatus;
  const statusConfig = orderStatusConfig[effectiveStatus];
  if (statusConfig && !statusConfig.allowedPaymentStatus.includes(effectivePaymentStatus)) {
    throw createError({
      message: `Payment status ${effectivePaymentStatus} is not compatible with order status ${effectiveStatus}.`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Validation: Payment Status Transition
  if (newPaymentStatus !== undefined && newPaymentStatus !== existingOrder.paymentStatus) {
    const allowedPaymentTransitions = paymentStatusTransitions[existingOrder.paymentStatus as OrderPaymentStatus];
    if (!allowedPaymentTransitions || !allowedPaymentTransitions.includes(newPaymentStatus as OrderPaymentStatus)) {
      throw createError({
        message: `Payment status transition from ${existingOrder.paymentStatus} to ${newPaymentStatus} is not allowed.`,
        status: 400,
        code: errorCode.invalid,
      });
    }
  }

  return await prisma.$transaction(async (tx) => {
    const updateData: any = {};

    if (newStatus !== undefined) updateData.status = newStatus;
    if (newPaymentStatus !== undefined) updateData.paymentStatus = newPaymentStatus;
    if (customerName !== undefined) updateData.customerName = customerName.trim();
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone.trim();
    if (customerAddress !== undefined) updateData.customerAddress = customerAddress.trim();
    if (customerNotes !== undefined) updateData.customerNotes = customerNotes.trim();
    if (rejectedReason !== undefined) updateData.rejectedReason = rejectedReason.trim();
    if (cancelledReason !== undefined) updateData.cancelledReason = cancelledReason.trim();
    if (image !== undefined) updateData.image = image;

    if (newStatus === OrderStatus.REJECTED && (!rejectedReason || rejectedReason.trim().length === 0)) {
        throw createError({
            message: "Rejected reason is required when status is REJECTED.",
            status: 400,
            code: errorCode.invalid,
        });
    }

    if (newStatus === OrderStatus.CANCELLED && (!cancelledReason || cancelledReason.trim().length === 0)) {
        throw createError({
            message: "Cancelled reason is required when status is CANCELLED.",
            status: 400,
            code: errorCode.invalid,
        });
    }

    if (userId !== undefined) {
      const userIdNum = parseInt(String(userId), 10);
      const user = await tx.user.findUnique({ where: { id: userIdNum } });
      if (!user) {
        throw createError({
          message: "User not found.",
          status: 404,
          code: errorCode.notFound,
        });
      }
      updateData.user = { connect: { id: userIdNum } };
    }

    // Handle Items Update
    if (orderItemsData && orderItemsData.length > 0 && existingOrder.status === OrderStatus.PENDING) {
      // NOTE: For now, we only allow updating items if the status is PENDING or ACCEPTED
      // and we handle the stock adjustment.
      // However, the user request focuses on STATUS changes.
      // If items are changed, we should ideally refill old stock and take new stock.
      // But let's focus on the status changes as requested first.
      
      await tx.orderItem.deleteMany({ where: { orderId: existingOrder.id } });
      const calculatedTotalPrice = orderItemsData.reduce((acc, item) => {
        return acc + parseFloat(String(item.price)) * parseInt(String(item.quantity), 10);
      }, 0);
      updateData.totalPrice = calculatedTotalPrice;
      updateData.orderItems = {
        create: orderItemsData.map((item) => ({
          itemId: parseInt(String(item.itemId), 10),
          itemType: item.itemType || OrderItemType.PRODUCT_VARIANT,
          quantity: parseInt(String(item.quantity), 10),
          price: parseFloat(String(item.price)),
        })),
      };
    }

    const updatedOrder = await tx.order.update({
      where: { id: existingOrder.id },
      data: updateData,
      include: { orderItems: true },
    });

    // --- Status Transition Logic ---
    const statusChanged = newStatus !== undefined && newStatus !== existingOrder.status;

    if (statusChanged) {
      // Rejected or Cancelled: Refill stock and remove from reserved
      if (newStatus === OrderStatus.REJECTED || newStatus === OrderStatus.CANCELLED) {
        for (const item of existingOrder.orderItems) {
          if (item.itemType === OrderItemType.PRODUCT_VARIANT) {
            await tx.productVariant.update({
              where: { id: item.itemId },
              data: { stock: { increment: item.quantity } },
            });
            await tx.inventory.updateMany({
              where: { productVariantId: item.itemId },
              data: { reserved: { decrement: item.quantity } },
            });
          }
        }
      }

      // Done: Remove from reserved and reduce inventory quantity
      if (newStatus === OrderStatus.DONE) {
        for (const item of existingOrder.orderItems) {
          if (item.itemType === OrderItemType.PRODUCT_VARIANT) {
            await tx.inventory.updateMany({
              where: { productVariantId: item.itemId },
              data: {
                reserved: { decrement: item.quantity },
                quantity: { decrement: item.quantity },
              },
            });
          }
        }
      }
    }

    // Refund Logic: Triggered when status is CANCELLED and paymentStatus is updated to REFUNDED
    const isNowCancelled = (newStatus || existingOrder.status) === OrderStatus.CANCELLED;
    const paymentStatusChanged = newPaymentStatus !== undefined && newPaymentStatus !== existingOrder.paymentStatus;
    
    if (
      isNowCancelled &&
      paymentStatusChanged &&
      newPaymentStatus === OrderPaymentStatus.REFUNDED
    ) {
      await tx.refund.create({
        data: {
          orderId: existingOrder.id,
          amount: updatedOrder.totalPrice,
          reason: cancelledReason || `Order cancelled. Automatic refund for order ${updatedOrder.code}`,
        },
      });
    }

    return await enrichOrder(updatedOrder);
  });
};

export const deleteOrder = async (code: string) => {
  const normalizedCode = requireOrderCode(code);
  const existing = await findOrderRecordByCode(normalizedCode);
  if (!existing) {
    throw createError({
      message: "Order not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  await deleteOrderRecord(existing.id);
};
