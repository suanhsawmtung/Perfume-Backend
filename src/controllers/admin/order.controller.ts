import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import { parseOrderQueryParams } from "../../services/order/order.helpers";
import * as OrderService from "../../services/order/order.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const listOrders = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseOrderQueryParams(req.query);

    const {
      items: orders,
      currentPage,
      totalPages,
      pageSize,
    } = await OrderService.listOrders(queryParams);

    res.status(200).json({
      success: true,
      data: {
        orders,
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    });
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
      const error = createError({
        message: "Order code is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const order = await OrderService.getOrderDetail(code);

    res.status(200).json({
      success: true,
      data: { order },
      message: null,
    });
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
    const {
      status,
      paymentStatus,
      customerName,
      customerPhone,
      customerAddress,
      customerNotes,
      rejectedReason,
      cancelledReason,
      items,
      userId,
      source,
    } = req.body;

    const order = await OrderService.createOrder({
      status,
      paymentStatus,
      customerName,
      customerPhone,
      customerAddress,
      customerNotes,
      rejectedReason,
      cancelledReason,
      items,
      userId,
      source,
      image: req.file?.filename,
      ...(req.userId && { authenticatedUserId: req.userId }),
    });

    res.status(201).json({
      success: true,
      data: { order },
      message: "Order created successfully.",
    });
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
      const error = createError({
        message: "Order code is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const {
      status,
      paymentStatus,
      customerName,
      customerPhone,
      customerAddress,
      customerNotes,
      rejectedReason,
      cancelledReason,
      items,
      userId,
      source,
    } = req.body;

    const order = await OrderService.updateOrder(code, {
      status,
      paymentStatus,
      customerName,
      customerPhone,
      customerAddress,
      customerNotes,
      rejectedReason,
      cancelledReason,
      items,
      userId,
      source,
      image: req.file?.filename,
    });

    res.status(200).json({
      success: true,
      data: { order },
      message: "Order updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteOrder = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    if (!code) {
      const error = createError({
        message: "Order code is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    await OrderService.deleteOrder(code);

    res.status(200).json({
      success: true,
      data: null,
      message: "Order deleted successfully.",
    });
  } catch (error: any) {
    console.log(error);
    next(error);
  }
};
