import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { OrderService } from "../../services/order/order.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const orderService = new OrderService();

export const listMyOrders = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    const result = await orderService.listMyOrders(userId, req.query);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const cancelMyOrder = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    if (!code) {
      throw createError({
        message: "Order code is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await orderService.cancelMyOrder(code, req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

