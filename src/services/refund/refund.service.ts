import {
  PaymentStatus,
  Prisma,
  RefundStatus,
  TransactionDirection,
  TransactionType,
} from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import type {
  CreateRefundParams,
  ListRefundsParams,
  UpdateRefundParams,
} from "../../types/refund";
import { createError } from "../../utils/common";
import { calculateOrderPaymentStatus, findOrderRecordByCode } from "../order/order.helpers";
import {
  buildRefundWhere,
  findRefundById,
  findRefundByIdWithOrder,
  parseRefundQueryParams,
  updateRefundRecord
} from "./refund.helpers";

export const listRefunds = async (params: ListRefundsParams) => {
  const { pageSize, offset, search, status } = parseRefundQueryParams(params);

  const where = buildRefundWhere({
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
  });

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: offset,
    }),
    prisma.refund.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  return {
    items: refunds,
    currentPage,
    totalPages,
    pageSize,
    totalCount: total,
  };
};

export const getRefundDetail = async (id: number) => {
  const refund = await findRefundByIdWithOrder(id);

  if (!refund) {
    throw createError({
      message: "Refund not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return refund;
};

export const createRefund = async (params: CreateRefundParams) => {
  const { orderCode, amount, reason } = params;

  const order = await findOrderRecordByCode(orderCode);

  if (!order) {
    throw createError({
      message: `Order with code '${orderCode}' not found. Please check the code and try again.`,
      status: 404,
      code: errorCode.notFound,
    });
  }

  // Calculate total already paid for this order (successful payments)
  const totalPaidAggregate = await prisma.payment.aggregate({
    where: {
      orderId: order.id,
      status: PaymentStatus.SUCCESS,
      deletedAt: null,
    },
    _sum: {
      amount: true,
    },
  });

  const totalPaidAmount = Number(totalPaidAggregate._sum.amount || 0);

  if (totalPaidAmount === 0) {
    throw createError({
      message: `No successful payments found for this order. Cannot create a refund.`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Calculate total already refunded for this order (successful refunds)
  const totalRefundedAggregate = await prisma.refund.aggregate({
    where: {
      orderId: order.id,
      status: RefundStatus.SUCCESS,
      deletedAt: null,
    },
    _sum: {
      amount: true,
    },
  });

  const totalRefundedAmount = Number(totalRefundedAggregate._sum.amount || 0);
  const remainingRefundableBalance = totalPaidAmount - totalRefundedAmount;

  if (remainingRefundableBalance <= 0) {
    throw createError({
      message: `Already fully refunded for this order based on the total paid amount of ${totalPaidAmount}.`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (Number(amount) > remainingRefundableBalance) {
    throw createError({
      message: `The requested refund amount of ${amount} exceeds the remaining refundable balance of ${remainingRefundableBalance} (Total Paid: ${totalPaidAmount}, Total Refunded: ${totalRefundedAmount}).`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  return await prisma.$transaction(async (tx) => {
    const refund = await tx.refund.create({
      data: {
        order: { connect: { id: order.id } },
        amount,
        reason: reason ?? null,
        status: RefundStatus.SUCCESS,
      },
    });

    // Create Transaction record
    await tx.transaction.create({
      data: {
        type: TransactionType.REFUND,
        direction: TransactionDirection.OUT,
        amount: amount,
        source: `Order: ${order.code}`,
        note: reason ?? null,
      },
    });

    const newTotalRefundedAmount = totalRefundedAmount + Number(amount);
    const newStatus = calculateOrderPaymentStatus(
      Number(order.totalPrice),
      totalPaidAmount,
      newTotalRefundedAmount
    );

    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: newStatus },
    });

    return refund;
  });
};

export const updateRefund = async (id: number, params: UpdateRefundParams) => {
  const { reason } = params;

  const existing = await findRefundById(id);
  if (!existing) {
    throw createError({
      message: "Refund not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const data: Prisma.RefundUpdateInput = {};

  if (reason !== undefined) {
    data.reason = reason ?? null;
  }

  return await updateRefundRecord(id, data);
};

export const voidRefund = async (id: number) => {
  const existing = await findRefundByIdWithOrder(id);
  if (!existing) {
    throw createError({
      message: "Refund not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  if (existing.status === RefundStatus.VOIDED) {
    throw createError({
      message: "This refund is already voided.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return await prisma.$transaction(async (tx) => {
    await tx.refund.update({
      where: { id },
      data: { status: RefundStatus.VOIDED },
    });

    // Create REVERSAL Transaction
    await tx.transaction.create({
      data: {
        type: TransactionType.REVERSAL,
        direction: TransactionDirection.IN,
        amount: existing.amount,
        source: `Refund Reversal: Order: ${existing.order.code}`,
        note: `Voided refund ${existing.id}`,
      },
    });

    const [totalPaid, totalRefunded] = await Promise.all([
      tx.payment.aggregate({
        where: { orderId: existing.orderId, status: PaymentStatus.SUCCESS, deletedAt: null },
        _sum: { amount: true },
      }),
      tx.refund.aggregate({
        where: { orderId: existing.orderId, status: RefundStatus.SUCCESS, deletedAt: null },
        _sum: { amount: true },
      }),
    ]);

    const newStatus = calculateOrderPaymentStatus(
      Number(existing.order.totalPrice),
      Number(totalPaid._sum.amount || 0),
      Number(totalRefunded._sum.amount || 0)
    );

    await tx.order.update({
      where: { id: existing.orderId },
      data: { paymentStatus: newStatus },
    });
  });
};
