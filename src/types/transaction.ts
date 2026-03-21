import { TransactionDirection, TransactionType } from "@prisma/client";

export interface ListTransactionsParams {
  limit?: string | number;
  offset?: string | number;
  search?: string;
  type?: TransactionType;
  direction?: TransactionDirection;
}

export interface ParseTransactionsQueryParamsResult {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  type?: TransactionType | undefined;
  direction?: TransactionDirection | undefined;
}

export interface CreateTransactionParams {
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  source: string;
  reference?: string;
  note?: string;
}

export interface UpdateTransactionParams {
  source?: string;
  reference?: string;
  note?: string;
}
