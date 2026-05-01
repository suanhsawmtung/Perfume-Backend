import { Order } from "@prisma/client";
import { CursorPaginationParams, CursorPaginationResultT, ServiceResponseT } from "../../types/common";
import {
  CreateOrderParams,
  ListOrderResultT,
  ListOrdersParams,
  MyOrderT,
  UpdateOrderParams
} from "../../types/order";

export interface IAdminOrderService {
  listOrders(params: ListOrdersParams): Promise<ServiceResponseT<ListOrderResultT>>;
  getOrderDetail(code: string): Promise<ServiceResponseT<Order>>;
  createOrder(params: CreateOrderParams): Promise<ServiceResponseT<Order>>;
  updateOrder(code: string, params: UpdateOrderParams): Promise<ServiceResponseT<Order>>;
}

export interface IOrderService {
  listMyOrders(userId: number, params: CursorPaginationParams): Promise<ServiceResponseT<CursorPaginationResultT<MyOrderT>>>;
}
