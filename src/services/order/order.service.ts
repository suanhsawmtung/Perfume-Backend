import { OrderSource, OrderStatus, ReservationStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CursorPaginationParams, CursorPaginationResultT, ServiceResponseT } from "../../types/common";
import { ListOrderResultT, ListOrdersParams, MyOrderT } from "../../types/order";
import { buildOrderWhereClause, enrichOrders, findOrderRecordByCode, parseOrderQueryParams } from "./order.helpers";

import { IOrderService } from "./order.interface";
import { createError } from "../../utils/common";
import { errorCode } from "../../config/error-code";
import { OrderDto } from "../../dtos/order.dto";

export class OrderService implements IOrderService {
  async listMyOrders(
    userId: number,
    params: ListOrdersParams
  ): Promise<ServiceResponseT<ListOrderResultT<MyOrderT>>> {
    const { pageSize, offset, search, condition } = parseOrderQueryParams(params);

    const where = buildOrderWhereClause({
      ...(search && { search }),
      ...(condition && { condition }),
      userId,
      source: OrderSource.CUSTOMER,
    });

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          code: true,
          image: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          totalPrice: true,
          customerAddress: true,
          customerName: true,
          customerNotes: true,
          customerPhone: true,
          rejectedReason: true,
          cancelledReason: true,
          payments: true,
          refunds: true,
          orderItems: {
            select: {
              quantity: true,
              price: true,
              productVariant: {
                select: {
                  size: true,
                  images: {
                    where: {
                      isPrimary: true,
                    },
                    select: {
                      path: true,
                    },
                  },
                  product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      brand: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: (await enrichOrders(items))
          .map((order) => OrderDto.toOrderCard(order)),
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async cancelMyOrder(code: string, params: { cancelledReason: string }) {
    const order = await findOrderRecordByCode(code)

    if (!order) {
      throw createError({
        message: "Order not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw createError({
        message: "Order is already cancelled.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    if (!([OrderStatus.PENDING, OrderStatus.ACCEPTED] as OrderStatus[]).includes(order.status)) {
      throw createError({
        message: "Order cannot be cancelled.",
        status: 400,
        code: errorCode.invalid,
      });
    };

    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: {
          id: order.id
        },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledReason: params.cancelledReason,
        },
      });

      const activeReservations = await tx.reservation.findMany({
        where: {
          orderId: order.id,
          status: ReservationStatus.ACTIVE,
        },
      });

      await tx.reservation.updateMany({
        where: {
          orderId: order.id,
          status: ReservationStatus.ACTIVE,
        },
        data: { status: ReservationStatus.RELEASED },
      });

      for (const reservation of activeReservations) {
        await tx.productVariant.update({
          where: { id: reservation.productVariantId },
          data: {
            reserved: { decrement: reservation.quantity },
          },
        });
      }

      return updatedOrder;
    });

    return {
      success: true,
      data: result,
      message: "Order cancelled successfully",
    };
  }
}
