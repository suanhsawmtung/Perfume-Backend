import {
  PaymentStatus,
  Prisma,
  RefundStatus,
  TransactionDirection,
  TransactionType,
} from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import {
  CreatePaymentParams,
  ListPaymentsParams,
  UpdatePaymentParams,
} from "../../types/payment";
import { createError } from "../../utils/common";
import { calculateOrderPaymentStatus, findOrderRecordByCode } from "../order/order.helpers";
import {
  buildPaymentWhereClause,
  findPaymentById,
  parsePaymentQueryParams,
  updatePaymentRecord
} from "./payment.helpers";

export const listPayments = async (params: ListPaymentsParams) => {
  const { pageSize, offset, search, method, status } = parsePaymentQueryParams(params);

  const where = buildPaymentWhereClause({ search, method, status });

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
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
    prisma.payment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  return {
    items: payments,
    currentPage,
    totalPages,
    pageSize,
    totalCount: total,
  };
};

export const getPaymentDetail = async (id: number) => {
  const payment = await findPaymentById(id);

  if (!payment) {
    throw createError({
      message: "Payment not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return payment;
};

export const createPayment = async (params: CreatePaymentParams) => {
  const { orderCode, method, amount, reference, note, paidAt } = params;

  // Check if order exists using orderCode
  const order = await findOrderRecordByCode(orderCode);

  if (!order) {
    throw createError({
      message: `Order with code "${orderCode}" not found. Cannot create payment.`,
      status: 404,
      code: errorCode.notFound,
    });
  }

  if (Number(order.totalPrice) < Number(amount)) {
    throw createError({
      message: `Payment amount (${amount}) exceeds order total price (${order.totalPrice}).`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  const pendingPaymentCount = await prisma.payment.count({
    where: {
      orderId: order.id,
      status: "PENDING",
      deletedAt: null,
    },
  });

  if (pendingPaymentCount > 0) {
    throw createError({
      message: "There is a pending payment for this order. Please verify it first.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Calculate total already paid for this order (successful payments)
  const totalPaidAggregate = await prisma.payment.aggregate({
    where: {
      orderId: order.id,
      status: "SUCCESS",
      deletedAt: null,
    },
    _sum: {
      amount: true,
    },
  });

  const totalPaidAmount = Number(totalPaidAggregate._sum.amount || 0);
  const remainingBalance = Number(order.totalPrice) - totalPaidAmount;

  if (remainingBalance === 0) {
    throw createError({
      message: `Already paid for this order completely. Total paid: ${totalPaidAmount}.`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (Number(amount) > remainingBalance) {
    throw createError({
      message: `You already paid ${totalPaidAmount} for this order. The remaining balance is ${remainingBalance}. Your requested payment of ${amount} exceeds this balance.`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  // Calculate totalRefundedAmount (to avoid duplicate query in transaction if passed)
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

  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        order: { connect: { id: order.id } },
        method,
        amount,
        status: PaymentStatus.SUCCESS,
        reference: reference ?? null,
        note: note ?? null,
        paidAt: paidAt ? new Date(paidAt) : null,
      },
    });

    // Create Transaction record
    await tx.transaction.create({
      data: {
        type: TransactionType.PAYMENT,
        direction: TransactionDirection.IN,
        amount: amount,
        source: `Order: ${order.code}`,
        reference: reference ?? null,
        note: note ?? null,
      },
    });

    const newTotalPaidAmount = totalPaidAmount + Number(amount);
    const newStatus = calculateOrderPaymentStatus(
      Number(order.totalPrice),
      newTotalPaidAmount,
      totalRefundedAmount
    );

    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: newStatus },
    });

    return payment;
  });
};

export const updatePayment = async (id: number, params: UpdatePaymentParams) => {
  const { reference, note, paidAt, method } = params;

  const existing = await findPaymentById(id);
  if (!existing) {
    throw createError({
      message: "Payment not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const data: Prisma.PaymentUpdateInput = {};

  if (reference !== undefined) {
    data.reference = reference ?? null;
  }

  if (note !== undefined) {
    data.note = note ?? null;
  }

  if(paidAt !== undefined) {
    data.paidAt = paidAt ? new Date(paidAt) : null;
  }

  if(method !== undefined) {
    data.method = method;
  }

  return await updatePaymentRecord(id, data);
};

export const voidPayment = async (id: number) => {
  const existing = await findPaymentById(id);
  if (!existing) {
    throw createError({
      message: "Payment not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  if (existing.status === PaymentStatus.VOIDED) {
    throw createError({
      message: "This payment is already voided.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (existing.status !== PaymentStatus.SUCCESS) {
    throw createError({
      message: "Only SUCCESS payment can be voided.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id },
      data: { status: PaymentStatus.VOIDED },
    });

    // Create REVERSAL Transaction
    await tx.transaction.create({
      data: {
        type: TransactionType.REVERSAL,
        direction: TransactionDirection.OUT,
        amount: existing.amount,
        source: `Payment Reversal: Order: ${existing.order.code}`,
        reference: existing.reference,
        note: `Voided payment ${existing.id}`,
      },
    });

    const [totalPaid, totalRefunded] = await Promise.all([
      tx.payment.aggregate({
        where: {
          orderId: existing.orderId,
          status: PaymentStatus.SUCCESS,
          deletedAt: null,
        },
        _sum: { amount: true },
      }),
      tx.refund.aggregate({
        where: {
          orderId: existing.orderId,
          status: RefundStatus.SUCCESS,
          deletedAt: null,
        },
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

export const verifyPayment = async (id: number, status: "SUCCESS" | "FAILED") => {
  if (!["SUCCESS", "FAILED"].includes(status)) {
    throw createError({
      message: "Invalid status update. Only SUCCESS or FAILED are allowed.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const existing = await findPaymentById(id);
  if (!existing) {
    throw createError({
      message: "Payment not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  if (existing.status !== PaymentStatus.PENDING) {
    throw createError({
      message: `Cannot verify this payment. Current status is ${existing.status}, but it must be PENDING.`,
      status: 400,
      code: errorCode.invalid,
    });
  }

  if (existing.order.source !== "CUSTOMER") {
    throw createError({
      message: "Only payments from customer orders can be processed. This order source is " + existing.order.source + ".",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id },
      data: { status },
    });

    if (status === PaymentStatus.SUCCESS) {
      // Create Transaction record
      await tx.transaction.create({
        data: {
          type: TransactionType.PAYMENT,
          direction: TransactionDirection.IN,
          amount: existing.amount,
          source: `Order: ${existing.order.code}`,
          reference: existing.reference,
          note: existing.note,
        },
      });

      // Recalculate order payment status
      const [totalPaid, totalRefunded] = await Promise.all([
        tx.payment.aggregate({
          where: {
            orderId: existing.orderId,
            status: PaymentStatus.SUCCESS,
            deletedAt: null,
          },
          _sum: { amount: true },
        }),
        tx.refund.aggregate({
          where: {
            orderId: existing.orderId,
            status: RefundStatus.SUCCESS,
            deletedAt: null,
          },
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
    }

    return updatedPayment;
  });
};
