import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import { PublicUserResultT, PublicUserT } from "../../types/user";
import { IPublicUserService } from "./user.interface";

export class PublicUserService implements IPublicUserService {
  async listPublicUsers(
    limit?: number,
    offset?: number
  ): Promise<ServiceResponseT<PublicUserResultT>> {
    const pageSize = limit || 10;
    const skip = offset || 0;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          deletedAt: null,
          status: "ACTIVE", // Usually only show active users publicly
        },
        take: pageSize,
        skip,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.count({
        where: {
          deletedAt: null,
          status: "ACTIVE",
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(skip / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items as PublicUserT[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }
}