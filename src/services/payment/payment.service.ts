import { PaymentStatus, Prisma } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import {
  CreatePaymentParams,
  ListPaymentsParams,
  UpdatePaymentParams,
} from "../../types/payment";
import { createError } from "../../utils/common";
import { findOrderRecordByCode } from "../order/order.helpers";
import {
  buildPaymentWhereClause,
  createPaymentRecord,
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

  return await createPaymentRecord({
    order: { connect: { id: order.id } },
    method,
    amount,
    status: PaymentStatus.SUCCESS,
    reference: reference ?? null,
    note: note ?? null,
    paidAt: paidAt ? new Date(paidAt) : null,
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

  await updatePaymentRecord(id, { status: PaymentStatus.VOIDED });
};
