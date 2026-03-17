import { RefundStatus } from "@prisma/client";

export interface ListRefundsParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: RefundStatus;
}

export interface ParseRefundQueryParamsResult {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  status?: RefundStatus | undefined;
}

export type BuildRefundWhereParams = Omit<ListRefundsParams, "limit" | "offset">;

export interface CreateRefundParams {
  orderCode: string;
  amount: number;
  reason?: string;
  status?: RefundStatus;
}

export interface UpdateRefundParams {
  status?: RefundStatus;
  reason?: string;
}
