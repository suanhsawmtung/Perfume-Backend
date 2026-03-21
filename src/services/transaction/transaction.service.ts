import { Prisma, TransactionDirection, TransactionType } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import {
  CreateTransactionParams,
  ListTransactionsParams,
  UpdateTransactionParams,
} from "../../types/transaction";
import { createError } from "../../utils/common";
import {
  buildTransactionWhereClause,
  createTransactionRecord,
  deleteTransactionRecord,
  findTransactionById,
  parseTransactionsQueryParams,
  updateTransactionRecord,
} from "./transaction.helpers";

export const listTransactions = async (params: ListTransactionsParams) => {
  const { pageSize, offset, search, type, direction } = parseTransactionsQueryParams(params);

  const where = buildTransactionWhereClause({ search, type, direction });

  const [transactions, total] = await Promise.all([
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
    items: transactions,
    currentPage,
    totalPages,
    pageSize,
    totalCount: total,
  };
};

export const getTransactionDetail = async (id: number) => {
  const transaction = await findTransactionById(id);

  if (!transaction) {
    throw createError({
      message: "Transaction not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return transaction;
};

export const createTransaction = async (params: CreateTransactionParams & { userId?: number }) => {
  const { type, direction, amount, source, reference, note, userId } = params;

  let transactionDirection = direction;
  if (([
    TransactionType.REFUND,
    TransactionType.EXPENSE,
    TransactionType.WITHDRAWAL
  ] as TransactionType[]).includes(type)) {
    transactionDirection = TransactionDirection.OUT;
  } else if (type === TransactionType.PAYMENT) {
    transactionDirection = TransactionDirection.IN;
  }

  return await createTransactionRecord({
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
};

export const updateTransaction = async (id: number, params: UpdateTransactionParams) => {
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

  return await updateTransactionRecord(id, data);
};

export const deleteTransaction = async (id: number) => {
  const existing = await findTransactionById(id);
  if (!existing) {
    throw createError({
      message: "Transaction not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  await deleteTransactionRecord(id);
};
