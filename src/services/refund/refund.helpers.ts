import { Prisma, RefundStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import type { BuildRefundWhereParams, ParseRefundQueryParamsResult } from "../../types/refund";

export const parseRefundQueryParams = (
  query: any
): ParseRefundQueryParamsResult => {
  const pageSizeParam = Number(query.limit);
  const pageSize =
    Number.isNaN(pageSizeParam) || pageSizeParam <= 0
      ? 10
      : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search =
    typeof query.search === "string" && query.search.trim().length > 0
      ? query.search.trim()
      : undefined;

  let status: RefundStatus | undefined;
  if (typeof query.status === "string") {
    const statusValue = query.status.trim();
    if (Object.values(RefundStatus).includes(statusValue as RefundStatus)) {
      status = statusValue as RefundStatus;
    }
  }

  return {
    pageSize,
    offset,
    search,
    status,
  };
};

export const buildRefundWhere = ({
  search,
  status
}: BuildRefundWhereParams): Prisma.RefundWhereInput => {
  const where: Prisma.RefundWhereInput = {
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      {
        reason: {
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

  if(status){
    where.status = status;
  }

  return where;
};

export const findRefundById = async (id: number) => {
  return await prisma.refund.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
};

export const findRefundByIdWithOrder = async (id: number) => {
  return await prisma.refund.findFirst({
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
          status: true,
        },
      },
    },
  });
};

export const createRefundRecord = async (
  createRefundData: Prisma.RefundCreateInput
) => {
  return await prisma.refund.create({
    data: createRefundData,
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

export const updateRefundRecord = async (
  id: number,
  updateRefundData: Prisma.RefundUpdateInput
) => {
  return await prisma.refund.update({
    where: { id },
    data: updateRefundData,
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

export const deleteRefundRecord = async (id: number) => {
  return await prisma.refund.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
