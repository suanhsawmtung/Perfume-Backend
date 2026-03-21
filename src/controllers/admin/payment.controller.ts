import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import * as PaymentService from "../../services/payment/payment.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const listPayments = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await PaymentService.listPayments(req.query);

    return res.status(200).json({
      success: true,
      data: result,
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getPaymentDetail = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      const error = createError({
        message: "Payment ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const payment = await PaymentService.getPaymentDetail(id);

    return res.status(200).json({
      success: true,
      data: { payment },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createPayment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payment = await PaymentService.createPayment(req.body);

    return res.status(201).json({
      success: true,
      data: { payment },
      message: "Payment created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updatePayment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      const error = createError({
        message: "Payment ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const payment = await PaymentService.updatePayment(id, req.body);

    return res.status(200).json({
      success: true,
      data: { payment },
      message: "Payment updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const voidPayment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      const error = createError({
        message: "Valid Payment ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    await PaymentService.voidPayment(id);

    return res.status(200).json({
      success: true,
      data: null,
      message: "Payment voided successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
