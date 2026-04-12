import { Transaction } from "@prisma/client";
import { CreateTransactionParams, ListTransactionResultT, ListTransactionsParams, ListTransactionT, UpdateTransactionParams } from "../../types/transaction";
import { ServiceResponseT } from "../../types/common";

export interface IAdminTransactionService {
  listTransactions(params: ListTransactionsParams): Promise<ServiceResponseT<ListTransactionResultT>>;
  getTransactionDetail(id: number): Promise<ServiceResponseT<ListTransactionT>>;
  createTransaction(params: CreateTransactionParams & { userId?: number }): Promise<ServiceResponseT<Transaction>>;
  updateTransaction(id: number, params: UpdateTransactionParams): Promise<ServiceResponseT<Transaction>>;
}
