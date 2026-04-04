import { InventoryType } from "@prisma/client";

export interface CreateInventoryParams {
  productVariantId: number;
  type: InventoryType;
  quantity: number;
  unitCost?: number | undefined;
  totalCost?: number | undefined;
}

export interface ListInventoriesParams {
  type: string;
  limit?: number | undefined;
  offset?: number | undefined;
  search?: string | undefined;
}

export interface ParseInventoryQueryParamsResult {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  type: string;
}