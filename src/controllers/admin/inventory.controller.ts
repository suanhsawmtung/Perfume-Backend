import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { AdminInventoryService } from "../../services/inventory/admin.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const adminInventoryService = new AdminInventoryService();

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

    const result = await adminInventoryService.listInventories({
      ...req.query,
      type,
    });
    return res.status(200).json(result);
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
    const adminId = req.userId;
    const result = await adminInventoryService.createInventory({
      ...req.body,
      createdById: adminId,
    });
    return res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};