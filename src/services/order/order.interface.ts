import { Order } from "@prisma/client";
import { ServiceResponseT } from "../../types/common";
import {
  CreateOrderParams,
  ListOrderResultT,
  ListOrdersParams,
  ListOrderT,
  UpdateOrderParams,
} from "../../types/order";

export interface IAdminOrderService {
  listOrders(params: ListOrdersParams): Promise<ServiceResponseT<ListOrderResultT>>;
  getOrderDetail(code: string): Promise<ServiceResponseT<ListOrderT>>;
  createOrder(params: CreateOrderParams): Promise<ServiceResponseT<ListOrderT>>;
  updateOrder(code: string, params: UpdateOrderParams): Promise<ServiceResponseT<ListOrderT>>;
}
