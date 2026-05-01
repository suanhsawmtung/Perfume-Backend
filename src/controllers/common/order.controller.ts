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
    const { cursor, limit } = req.query;

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    const result = await orderService.listMyOrders(userId, {
      cursor: cursor as string,
      limit: limit as string,
    });
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
