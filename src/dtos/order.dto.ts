import { MyOrderT, OrderCardQueryDataT } from "../types/order";

export class OrderDto {
    static toOrderCard(order: OrderCardQueryDataT): MyOrderT {
        return {
            id: order.id,
            code: order.code,
            image: order.image,
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            totalPrice: order.totalPrice,
            customerAddress: order.customerAddress,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerNotes: order.customerNotes,
            cancelledReason: order.cancelledReason,
            rejectedReason: order.rejectedReason,
            totalPaidAmount: order.totalPaidAmount || 0,
            totalRefundAmount: order.totalRefundAmount || 0,
            orderItems: order.orderItems.map((item) => {
                return {
                    quantity: item.quantity,
                    price: item.price,
                    size: item.productVariant.size,
                    image: item.productVariant.images[0]?.path || null,
                    product: {
                        id: item.productVariant.product.id,
                        slug: item.productVariant.product.slug,
                        name: item.productVariant.product.name,
                        brand: item.productVariant.product.brand.name,
                    },
                };
            }),
        };
    }
}
