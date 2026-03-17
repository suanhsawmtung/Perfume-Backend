import { PaymentMethod, PaymentStatus } from "@prisma/client";

export interface ListPaymentsParams {
  pageSize?: number | undefined;
  offset?: number | undefined;
  search?: string | undefined;
  method?: PaymentMethod | undefined;
  status?: PaymentStatus | undefined;
}

export interface ParsePaymentQueryParamsResult {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  method?: PaymentMethod | undefined;
  status?: PaymentStatus | undefined;
}

export interface CreatePaymentParams {
  orderId: number;
  method: PaymentMethod;
  amount: number;
  status?: PaymentStatus | undefined;
  reference?: string | undefined;
  note?: string | undefined;
  paidAt?: Date | undefined;
}

export interface UpdatePaymentParams {
  status?: PaymentStatus | undefined;
  reference?: string | undefined;
  note?: string | undefined;
}
