import { Prisma } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import type {
  CreateRefundParams,
  ListRefundsParams,
  UpdateRefundParams,
} from "../../types/refund";
import { createError } from "../../utils/common";
import { findOrderRecordByCode } from "../order/order.helpers";
import {
  buildRefundWhere,
  createRefundRecord,
  deleteRefundRecord,
  findRefundById,
  findRefundByIdWithOrder,
  parseRefundQueryParams,
  updateRefundRecord,
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
  const { orderCode, amount, reason, status } = params;

  const order = await findOrderRecordByCode(orderCode);

  if (!order) {
    throw createError({
      message: `Order with code '${orderCode}' not found. Please check the code and try again.`,
      status: 404,
      code: errorCode.notFound,
    });
  }

  if (Number(order.totalPrice) < Number(amount)) {
    throw createError({
      message: "Refund amount is greater than order total price.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return await createRefundRecord({
    order: { connect: { id: order.id } },
    amount,
    reason: reason ?? null,
    status: status ?? "PENDING",
  });
};

export const updateRefund = async (id: number, params: UpdateRefundParams) => {
  const { reason, status } = params;

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

  if (status !== undefined) {
    data.status = status;
  }

  return await updateRefundRecord(id, data);
};

export const deleteRefund = async (id: number) => {
  const existing = await findRefundById(id);
  if (!existing) {
    throw createError({
      message: "Refund not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  await deleteRefundRecord(id);
};
