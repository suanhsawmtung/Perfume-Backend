import { InventoryType } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
  CreateInventoryParams,
  ListInventoriesParams,
  ListInventoryResultT,
  ListInventoryT,
} from "../../types/inventory";
import { createError } from "../../utils/common";
import { buildInventoryWhereClause, parseInventoryQueryParams } from "./inventory.helpers";
import { IAdminInventoryService } from "./inventory.interface";

export class AdminInventoryService implements IAdminInventoryService {
  async listInventories(
    params: ListInventoriesParams
  ): Promise<ServiceResponseT<ListInventoryResultT>> {
    const { pageSize, offset, search, type } = parseInventoryQueryParams(params);

    const where = buildInventoryWhereClause({ search, type });

    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          productVariant: {
            select: {
              id: true,
              sku: true,
              slug: true,
              size: true,
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.inventory.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items as ListInventoryT[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async createInventory(
    params: CreateInventoryParams & { createdById?: number }
  ): Promise<ServiceResponseT<null>> {
    const { productVariantId, type, quantity, unitCost, createdById } = params;

    if (type === InventoryType.SALE) {
      throw createError({
        message: "Manual creation of sales records is not allowed.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: productVariantId },
      });

      if (!variant) {
        throw createError({
          message: "Product variant not found.",
          status: 404,
          code: errorCode.notFound,
        });
      }

      const isPurchase = type === InventoryType.PURCHASE;
      const isIncrement = ([
        InventoryType.PURCHASE,
        InventoryType.ADJUSTMENT_IN,
        InventoryType.RETURN_FROM_CUSTOMER,
      ] as InventoryType[]).includes(type);

      let newStock = Number(variant.stock);
      let newTotalCost = Number(variant.totalCost);

      let inventoryUnitCost: number;
      let inventoryTotalCost: number;

      if (isPurchase) {
        if (!unitCost) {
          throw createError({
            message: "Unit cost is required for purchase transactions.",
            status: 400,
            code: errorCode.invalid,
          });
        }
        inventoryUnitCost = Number(unitCost);
        inventoryTotalCost = inventoryUnitCost * quantity;

        newStock += quantity;
        newTotalCost += inventoryTotalCost;
      } else {
        if (type === InventoryType.ADJUSTMENT_IN && newStock <= 0) {
          throw createError({
            message: "Adjustment incoming is not allowed when current stock is 0.",
            status: 400,
            code: errorCode.invalid,
          });
        }

        const avgCost = newStock > 0 ? newTotalCost / newStock : 0;
        inventoryUnitCost = avgCost;
        inventoryTotalCost = avgCost * quantity;

        if (isIncrement) {
          newStock += quantity;
          newTotalCost += inventoryTotalCost;
        } else {
          if (newStock < quantity) {
            throw createError({
              message: "Insufficient stock for this inventory transaction.",
              status: 400,
              code: errorCode.invalid,
            });
          }

          newStock -= quantity;
          newTotalCost -= inventoryTotalCost;
        }
      }

      const inventory = await tx.inventory.create({
        data: {
          productVariantId,
          type,
          quantity,
          unitCost: inventoryUnitCost,
          totalCost: inventoryTotalCost,
          createdById: createdById ?? null,
        },
      });

      if (isPurchase) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        await tx.transaction.create({
          data: {
            type: "EXPENSE",
            direction: "OUT",
            amount: inventoryTotalCost,
            source: "Inventory Purchase",
            reference: `INV-${dateStr}-${inventory.id}`,
            note: `Purchase of ${quantity} units for variant ID ${productVariantId}`,
          },
        });
      }

      await tx.productVariant.update({
        where: { id: productVariantId },
        data: {
          stock: newStock,
          totalCost: newTotalCost,
        },
      });
    });

    return {
      success: true,
      data: null,
      message: "Inventory recorded successfully.",
    };
  }
}
