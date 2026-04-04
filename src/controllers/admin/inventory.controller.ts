import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import * as InventoryService from "../../services/inventory/inventory.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const listInventories = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = req.params.type;
    if (!type) {
      throw createError({
        message: "Inventory type is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }
 
    const { limit, offset, search } = req.query;
 
    const data = await InventoryService.listInventories({
      type,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      search: search as string,
    });
 
    return res.status(200).json({
      success: true,
      data,
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createInventory = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productVariantId, type, quantity, unitCost } = req.body;
    const adminId = req.userId!;

    const inventory = await InventoryService.createInventory({
      productVariantId: Number(productVariantId),
      type,
      quantity: Number(quantity),
      unitCost: unitCost ? Number(unitCost) : undefined,
      createdById: adminId,
    });

    return res.status(201).json({
      success: true,
      data: inventory,
      message: "Inventory record created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};