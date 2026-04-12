import { Payment } from "@prisma/client";
import { CreatePaymentParams, ListPaymentResultT, ListPaymentsParams, ListPaymentT, UpdatePaymentParams } from "../../types/payment";
import { ServiceResponseT } from "../../types/common";

export interface IAdminPaymentService {
  listPayments(params: ListPaymentsParams): Promise<ServiceResponseT<ListPaymentResultT>>;
  getPaymentDetail(id: number): Promise<ServiceResponseT<ListPaymentT>>;
  createPayment(params: CreatePaymentParams): Promise<ServiceResponseT<Payment>>;
  updatePayment(id: number, params: UpdatePaymentParams): Promise<ServiceResponseT<Payment>>;
  approvePayment(id: number): Promise<ServiceResponseT<Payment>>;
  rejectPayment(id: number): Promise<ServiceResponseT<Payment>>;
  voidPayment(id: number): Promise<ServiceResponseT<null>>;
}
