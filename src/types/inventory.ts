import { Inventory, InventoryType } from "@prisma/client";

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

export type ListInventoryT = Inventory & {
  productVariant: {
    id: number;
    sku: string;
    product: {
      id: number;
      name: string;
    };
  };
  createdBy: {
    id: number;
    username: string;
  } | null;
};

export type ListInventoryResultT = {
  items: ListInventoryT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};