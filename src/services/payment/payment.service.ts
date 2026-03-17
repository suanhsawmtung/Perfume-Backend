import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import {
  CreatePaymentParams,
  ListPaymentsParams,
  UpdatePaymentParams,
} from "../../types/payment";
import { createError } from "../../utils/common";
import {
  buildPaymentWhereClause,
  createPaymentRecord,
  deletePaymentRecord,
  findPaymentById,
  parsePaymentQueryParams,
  updatePaymentRecord,
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

export const getPaymentDetail = async (id: string) => {
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
  const { orderId, method, amount, status, reference, note, paidAt } = params;

  // Check if order exists
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    throw createError({
      message: "Order not found. Cannot create payment for a non-existent order.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return await createPaymentRecord({
    order: { connect: { id: orderId } },
    method,
    amount,
    status: status || "PENDING",
    reference: reference ?? null,
    note: note ?? null,
    paidAt: paidAt ? new Date(paidAt) : null,
  });
};

export const updatePayment = async (id: string, params: UpdatePaymentParams) => {
  const { status, reference, note } = params;

  const existing = await findPaymentById(id);
  if (!existing) {
    throw createError({
      message: "Payment not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const data: Prisma.PaymentUpdateInput = {};

  if (status !== undefined) {
    data.status = status;
  }

  if (reference !== undefined) {
    data.reference = reference ?? null;
  }

  if (note !== undefined) {
    data.note = note ?? null;
  }

  return await updatePaymentRecord(id, data);
};

export const deletePayment = async (id: string) => {
  const existing = await findPaymentById(id);
  if (!existing) {
    throw createError({
      message: "Payment not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  await deletePaymentRecord(id);
};
