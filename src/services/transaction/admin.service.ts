import { Prisma, Transaction, TransactionDirection, TransactionType } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
    CreateTransactionParams,
    ListTransactionResultT,
    ListTransactionsParams,
    ListTransactionT,
    UpdateTransactionParams,
} from "../../types/transaction";
import { createError } from "../../utils/common";
import {
    buildTransactionWhereClause,
    createTransactionRecord,
    findTransactionById,
    parseTransactionsQueryParams,
    updateTransactionRecord,
} from "./transaction.helpers";
import { IAdminTransactionService } from "./transaction.interface";

export class AdminTransactionService implements IAdminTransactionService {
  async listTransactions(
    params: ListTransactionsParams
  ): Promise<ServiceResponseT<ListTransactionResultT>> {
    const { pageSize, offset, search, type, direction } =
      parseTransactionsQueryParams(params);

    const where = buildTransactionWhereClause({
      ...(search && { search }),
      ...(type && { type }),
      ...(direction && { direction }),
    });

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: pageSize,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items as ListTransactionT[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async getTransactionDetail(id: number): Promise<ServiceResponseT<ListTransactionT>> {
    const transaction = await findTransactionById(id);

    if (!transaction) {
      throw createError({
        message: "Transaction not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: transaction as ListTransactionT,
      message: null,
    };
  }

  async createTransaction(
    params: CreateTransactionParams & { userId?: number }
  ): Promise<ServiceResponseT<Transaction>> {
    const { type, direction, amount, source, reference, note, userId } = params;

    let transactionDirection = direction;
    if (
      ([
        TransactionType.REFUND,
        TransactionType.EXPENSE,
        TransactionType.WITHDRAWAL,
      ] as TransactionType[]).includes(type)
    ) {
      transactionDirection = TransactionDirection.OUT;
    } else if (type === TransactionType.PAYMENT) {
      transactionDirection = TransactionDirection.IN;
    }

    const transaction = await createTransactionRecord({
      type,
      direction: transactionDirection,
      amount,
      source,
      reference: reference ?? null,
      note: note ?? null,
      ...(userId && {
        createdBy: { connect: { id: userId } },
      }),
    });

    return {
      success: true,
      data: transaction,
      message: "Transaction created successfully.",
    };
  }

  async updateTransaction(
    id: number,
    params: UpdateTransactionParams
  ): Promise<ServiceResponseT<Transaction>> {
    const { source, reference, note } = params;

    const existing = await findTransactionById(id);
    if (!existing) {
      throw createError({
        message: "Transaction not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const data: Prisma.TransactionUpdateInput = {};

    if (source !== undefined) {
      data.source = source;
    }

    if (reference !== undefined) {
      data.reference = reference ?? null;
    }

    if (note !== undefined) {
      data.note = note ?? null;
    }

    const transaction = await updateTransactionRecord(id, data);

    return {
      success: true,
      data: transaction,
      message: "Transaction updated successfully.",
    };
  }
}
