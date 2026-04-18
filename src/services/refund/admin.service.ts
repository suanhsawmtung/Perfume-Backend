import {
    PaymentStatus,
    Refund,
    RefundStatus,
    TransactionDirection,
    TransactionType
} from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
    CreateRefundParams,
    ListRefundResultT,
    ListRefundsParams,
    ListRefundT,
    UpdateRefundParams,
} from "../../types/refund";
import { createError } from "../../utils/common";
import { calculateOrderPaymentStatus, findOrderRecordByCode } from "../order/order.helpers";
import {
    buildRefundWhereClause,
    findRefundById,
    findRefundByIdWithOrder,
    parseRefundQueryParams,
    updateRefundRecord,
} from "./refund.helpers";
import { IAdminRefundService } from "./refund.interface";

export class AdminRefundService implements IAdminRefundService {
  async listRefunds(
    params: ListRefundsParams
  ): Promise<ServiceResponseT<ListRefundResultT>> {
    const { pageSize, offset, search, status } = parseRefundQueryParams(params);

    const where = buildRefundWhereClause({
      ...(search && { search }),
      ...(status && { status }),
    });

    const [items, total] = await Promise.all([
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
      success: true,
      data: {
        items: items as ListRefundT[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async getRefundDetail(id: number): Promise<ServiceResponseT<ListRefundT>> {
    const refund = await findRefundByIdWithOrder(id);

    if (!refund) {
      throw createError({
        message: "Refund not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: refund as ListRefundT,
      message: null,
    };
  }

  async createRefund(params: CreateRefundParams): Promise<ServiceResponseT<Refund>> {
    const { orderCode, amount, reason } = params;

    const order = await findOrderRecordByCode(orderCode);

    if (!order) {
      throw createError({
        message: `Order with code '${orderCode}' not found.`,
        status: 404,
        code: errorCode.notFound,
      });
    }

    const [totalPaidAggregate, totalRefundedAggregate] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          orderId: order.id,
          status: PaymentStatus.SUCCESS,
          deletedAt: null,
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.refund.aggregate({
        where: {
          orderId: order.id,
          status: RefundStatus.SUCCESS,
          deletedAt: null,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalPaidAmount = Number(totalPaidAggregate._sum.amount || 0);

    if (totalPaidAmount === 0) {
      throw createError({
        message: `No successful payments found for this order. Cannot create a refund.`,
        status: 400,
        code: errorCode.invalid,
      });
    }

    const totalRefundedAmount = Number(totalRefundedAggregate._sum.amount || 0);
    const remainingRefundableBalance = totalPaidAmount - totalRefundedAmount;

    if (remainingRefundableBalance <= 0) {
      throw createError({
        message: `Already fully refunded for this order.`,
        status: 400,
        code: errorCode.invalid,
      });
    }

    if (Number(amount) > remainingRefundableBalance) {
      throw createError({
        message: `The requested refund amount exceeds the remaining refundable balance of ${remainingRefundableBalance}.`,
        status: 400,
        code: errorCode.invalid,
      });
    }

    const refund = await prisma.$transaction(async (tx) => {
      const newRefund = await tx.refund.create({
        data: {
          order: { connect: { id: order.id } },
          amount,
          reason: reason ?? null,
          status: RefundStatus.SUCCESS,
        },
      });

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

      return newRefund;
    });

    return {
      success: true,
      data: refund,
      message: "Refund created successfully.",
    };
  }

  async updateRefund(
    id: number,
    params: UpdateRefundParams
  ): Promise<ServiceResponseT<Refund>> {
    const { reason } = params;

    const existing = await findRefundById(id);
    if (!existing) {
      throw createError({
        message: "Refund not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const refund = await updateRefundRecord(id, {
      reason: reason ?? null,
    });

    return {
      success: true,
      data: refund,
      message: "Refund updated successfully.",
    };
  }

  async deleteRefund(id: number): Promise<ServiceResponseT<null>> {
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

    await prisma.$transaction(async (tx) => {
      await tx.refund.update({
        where: { id },
        data: { status: RefundStatus.VOIDED },
      });

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

    return {
      success: true,
      data: null,
      message: "Refund deleted/voided successfully.",
    };
  }
}
