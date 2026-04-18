import {
    Payment,
    PaymentStatus,
    Prisma,
    RefundStatus,
    TransactionDirection,
    TransactionType,
} from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
    CreatePaymentParams,
    ListPaymentResultT,
    ListPaymentsParams,
    ListPaymentT,
    UpdatePaymentParams,
} from "../../types/payment";
import { createError } from "../../utils/common";
import { calculateOrderPaymentStatus, findOrderRecordByCode } from "../order/order.helpers";
import {
    buildPaymentWhereClause,
    findPaymentById,
    parsePaymentQueryParams,
    updatePaymentRecord,
} from "./payment.helpers";
import { IAdminPaymentService } from "./payment.interface";

export class AdminPaymentService implements IAdminPaymentService {
  async listPayments(
    params: ListPaymentsParams
  ): Promise<ServiceResponseT<ListPaymentResultT>> {
    const { pageSize, offset, search, method, status } = parsePaymentQueryParams(params);

    const where = buildPaymentWhereClause({
      ...(search && { search }),
      ...(method && { method }),
      ...(status && { status }),
    });

    const [items, total] = await Promise.all([
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
      success: true,
      data: {
        items: items as ListPaymentT[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async getPaymentDetail(id: number): Promise<ServiceResponseT<ListPaymentT>> {
    const payment = await findPaymentById(id);

    if (!payment) {
      throw createError({
        message: "Payment not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: payment as ListPaymentT,
      message: null,
    };
  }

  async createPayment(params: CreatePaymentParams): Promise<ServiceResponseT<Payment>> {
    const { orderCode, method, amount, reference, note, paidAt } = params;

    const order = await findOrderRecordByCode(orderCode);

    if (!order) {
      throw createError({
        message: `Order with code "${orderCode}" not found.`,
        status: 404,
        code: errorCode.notFound,
      });
    }

    const [pendingPaymentCount, totalPaidAggregate, totalRefundedAggregate] = await Promise.all([
      prisma.payment.count({
        where: {
          orderId: order.id,
          status: PaymentStatus.PENDING,
          deletedAt: null,
        },
      }),
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

    if (pendingPaymentCount > 0) {
      throw createError({
        message: "There is a pending payment for this order.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const totalPaidAmount = Number(totalPaidAggregate._sum.amount || 0);
    const remainingBalance = Number(order.totalPrice) - totalPaidAmount;

    if (remainingBalance <= 0) {
      throw createError({
        message: `Already paid for this order completely.`,
        status: 400,
        code: errorCode.invalid,
      });
    }

    if (Number(amount) > remainingBalance) {
      throw createError({
        message: `Requested payment exceeds remaining balance of ${remainingBalance}.`,
        status: 400,
        code: errorCode.invalid,
      });
    }

    const totalRefundedAmount = Number(totalRefundedAggregate._sum.amount || 0);

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
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

      return newPayment;
    });

    return {
      success: true,
      data: payment,
      message: "Payment created successfully.",
    };
  }

  async updatePayment(
    id: number,
    params: UpdatePaymentParams
  ): Promise<ServiceResponseT<Payment>> {
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

    if (paidAt !== undefined) {
      data.paidAt = paidAt ? new Date(paidAt) : null;
    }

    if (method !== undefined) {
      data.method = method;
    }

    const payment = await updatePaymentRecord(id, data);

    return {
      success: true,
      data: payment,
      message: "Payment updated successfully.",
    };
  }

  async approvePayment(id: number): Promise<ServiceResponseT<Payment>> {
    return this.verifyPaymentInternal(id, PaymentStatus.SUCCESS);
  }

  async rejectPayment(id: number): Promise<ServiceResponseT<Payment>> {
    return this.verifyPaymentInternal(id, PaymentStatus.FAILED);
  }

  async voidPayment(id: number): Promise<ServiceResponseT<null>> {
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
        message: "Only SUCCESS payments can be voided.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id },
        data: { status: PaymentStatus.VOIDED },
      });

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
      message: "Payment voided successfully.",
    };
  }

  private async verifyPaymentInternal(
    id: number,
    status: PaymentStatus
  ): Promise<ServiceResponseT<Payment>> {
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
        message: "Only PENDING payments can be verified.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: { status },
      });

      if (status === PaymentStatus.SUCCESS) {
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
      }

      return updatedPayment;
    });

    return {
      success: true,
      data: payment,
      message: `Payment ${status === PaymentStatus.SUCCESS ? "approved" : "rejected"} successfully.`,
    };
  }
}
