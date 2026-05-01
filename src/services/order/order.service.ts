import { prisma } from "../../lib/prisma";
import { CursorPaginationParams, CursorPaginationResultT, ServiceResponseT } from "../../types/common";
import { MyOrderT } from "../../types/order";

import { IOrderService } from "./order.interface";

export class OrderService implements IOrderService {
  async listMyOrders(
    userId: number,
    params: CursorPaginationParams
  ): Promise<ServiceResponseT<CursorPaginationResultT<MyOrderT>>> {
    const { cursor, limit = 10 } = params;
    const take = Number(limit);

    const orders = await prisma.order.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      take: take + 1,
      ...(cursor && { cursor: { id: Number(cursor) } }),
      ...(cursor && { skip: 1 }),
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        code: true,
        image: true,
        status: true,
        createdAt: true,
        totalPrice: true,
        customerAddress: true,
        customerName: true,
        customerNotes: true,
        customerPhone: true,
        rejectedReason: true,
        cancelledReason: true,
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
    });

    let nextCursor: number | null = null;

    if (orders.length > take) {
      orders.pop();
      nextCursor = orders[orders.length - 1]?.id || null;
    }

    return {
      success: true,
      data: {
        items: orders,
        nextCursor,
      },
      message: null,
    };
  }
}
