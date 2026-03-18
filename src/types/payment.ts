import { PaymentMethod, PaymentStatus } from "@prisma/client";

export interface ListPaymentsParams {
  limit?: number | undefined;
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
  orderCode: string;
  method: PaymentMethod;
  amount: number;
  reference?: string | undefined;
  note?: string | undefined;
  paidAt?: Date | undefined;
}

export interface UpdatePaymentParams {
  reference?: string | undefined;
  note?: string | undefined;
  paidAt?: Date | undefined;
  method?: PaymentMethod | undefined;
}
