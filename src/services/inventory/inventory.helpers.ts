import { InventoryType, Prisma } from "@prisma/client";
import { ListInventoriesParams } from "../../types/inventory";

export const parseInventoryQueryParams = (query: ListInventoriesParams) => {
  const pageSizeParam = Number(query.limit);
  const pageSize = Number.isNaN(pageSizeParam) || pageSizeParam <= 0 ? 10 : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search = typeof query.search === "string" && query.search.trim().length > 0 ? query.search.trim() : undefined;

  let type: InventoryType | undefined;
  if (typeof query.type === "string" && Object.values(InventoryType).includes(query.type as InventoryType)) {
    type = query.type as InventoryType;
  }

  return { pageSize, offset, search, type };
};

export const buildInventoryWhereClause = (params: {
  search?: string | undefined;
  type?: InventoryType | undefined;
}): Prisma.InventoryWhereInput => {
  const { search, type } = params;
  const where: Prisma.InventoryWhereInput = {};

  if (search) {
    const orConditions: Prisma.InventoryWhereInput[] = [
      {
        createdBy: {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        },
      },
      {
        productVariant: {
          product: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              {
                brand: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          },
        },
      },
      {
        productVariant: {
          sku: { contains: search, mode: "insensitive" },
        },
      },
    ];

    // Handle numeric search for size
    const searchNumber = parseInt(search, 10);
    if (!isNaN(searchNumber)) {
      orConditions.push({
        productVariant: {
          size: { equals: searchNumber },
        },
      });
    }

    where.OR = orConditions;
  }

  if (type) {
    where.type = type;
  }

  return where;
};