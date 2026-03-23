import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ParsePaymentQueryParamsResult } from "../../types/payment";

export const parsePaymentQueryParams = (query: any): ParsePaymentQueryParamsResult => {
  const pageSizeParam = Number(query.limit || query.pageSize);
  const pageSize = Number.isNaN(pageSizeParam) || pageSizeParam <= 0 ? 10 : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search = typeof query.search === "string" && query.search.trim().length > 0 ? query.search.trim() : undefined;

  let method: PaymentMethod | undefined;
  if (typeof query.method === "string" && Object.values(PaymentMethod).includes(query.method as PaymentMethod)) {
    method = query.method as PaymentMethod;
  }

  let status: PaymentStatus | undefined;
  if (typeof query.status === "string" && Object.values(PaymentStatus).includes(query.status as PaymentStatus)) {
    status = query.status as PaymentStatus;
  }

  return {
    pageSize,
    offset,
    search,
    method,
    status,
  };
};

export const buildPaymentWhereClause = (params: {
  search?: string | undefined;
  method?: PaymentMethod | undefined;
  status?: PaymentStatus | undefined;
}): Prisma.PaymentWhereInput => {
  const { search, method, status } = params;
  const where: Prisma.PaymentWhereInput = {
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
        order: {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (method) {
    where.method = method;
  }

  if (status) {
    where.status = status;
  }

  return where;
};

export const findPaymentById = async (id: number) => {
  return await prisma.payment.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      order: {
        select: {
          id: true,
          code: true,
          totalPrice: true,
          source: true,
        },
      },
    },
  });
};

export const createPaymentRecord = async (data: Prisma.PaymentCreateInput) => {
  return await prisma.payment.create({
    data,
    include: {
      order: {
        select: {
          id: true,
          code: true,
        },
      },
    },
  });
};

export const updatePaymentRecord = async (id: number, data: Prisma.PaymentUpdateInput) => {
  return await prisma.payment.update({
    where: { id },
    data,
    include: {
      order: {
        select: {
          id: true,
          code: true,
        },
      },
    },
  });
};

export const deletePaymentRecord = async (id: number) => {
  return await prisma.payment.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
