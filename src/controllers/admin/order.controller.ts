import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { AdminOrderService } from "../../services/order/admin.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const adminOrderService = new AdminOrderService();

export const listOrders = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminOrderService.listOrders(req.query);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getOrder = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    if (!code) {
      throw createError({
        message: "Order code is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminOrderService.getOrderDetail(code);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const createOrder = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminOrderService.createOrder({
      ...req.body,
      userId: req.userId,
    });

    return res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const updateOrder = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    if (!code) {
      throw createError({
        message: "Order code is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminOrderService.updateOrder(code, {
      ...req.body,
      image: req.file?.filename,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
