import { Refund } from "@prisma/client";
import { CreateRefundParams, ListRefundResultT, ListRefundsParams, ListRefundT, UpdateRefundParams } from "../../types/refund";
import { ServiceResponseT } from "../../types/common";

export interface IAdminRefundService {
  listRefunds(params: ListRefundsParams): Promise<ServiceResponseT<ListRefundResultT>>;
  getRefundDetail(id: number): Promise<ServiceResponseT<ListRefundT>>;
  createRefund(params: CreateRefundParams): Promise<ServiceResponseT<Refund>>;
  updateRefund(id: number, params: UpdateRefundParams): Promise<ServiceResponseT<Refund>>;
  deleteRefund(id: number): Promise<ServiceResponseT<null>>;
}
