import { Prisma, TransactionDirection, TransactionType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ListTransactionsParams, ParseTransactionsQueryParamsResult } from "../../types/transaction";

export const parseTransactionsQueryParams = (query: ListTransactionsParams): ParseTransactionsQueryParamsResult => {
  const pageSizeParam = Number(query.limit);
  const pageSize = Number.isNaN(pageSizeParam) || pageSizeParam <= 0 ? 10 : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search = typeof query.search === "string" && query.search.trim().length > 0 ? query.search.trim() : undefined;

  let type: TransactionType | undefined;
  if (typeof query.type === "string" && Object.values(TransactionType).includes(query.type as TransactionType)) {
    type = query.type as TransactionType;
  }

  let direction: TransactionDirection | undefined;
  if (typeof query.direction === "string" && Object.values(TransactionDirection).includes(query.direction as TransactionDirection)) {
    direction = query.direction as TransactionDirection;
  }

  return {
    pageSize,
    offset,
    search,
    type,
    direction,
  };
};

export const buildTransactionWhereClause = (params: {
  search?: string | undefined;
  type?: TransactionType | undefined;
  direction?: TransactionDirection | undefined;
}): Prisma.TransactionWhereInput => {
  const { search, type, direction } = params;
  const where: Prisma.TransactionWhereInput = {
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      {
        reference: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        note: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        source: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        createdBy: {
          OR: [
            {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      },
    ];
  }

  if (type) {
    where.type = type;
  }

  if (direction) {
    where.direction = direction;
  }

  return where;
};

export const findTransactionById = async (id: number) => {
  return await prisma.transaction.findFirst({
    where: {
      id,
      deletedAt: null,
    },
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
  });
};

export const createTransactionRecord = async (data: Prisma.TransactionCreateInput) => {
  return await prisma.transaction.create({
    data,
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
  });
};

export const updateTransactionRecord = async (id: number, data: Prisma.TransactionUpdateInput) => {
  return await prisma.transaction.update({
    where: { id },
    data,
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
  });
};

export const deleteTransactionRecord = async (id: number) => {
  return await prisma.transaction.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
