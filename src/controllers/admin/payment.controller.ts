import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import { AdminPaymentService } from "../../services/payment/admin.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const adminPaymentService = new AdminPaymentService();

export const listPayments = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminPaymentService.listPayments(req.query);
    return res.status(200).json(result);
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

    if (isNaN(id)) {
      throw createError({
        message: "Valid Payment ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminPaymentService.getPaymentDetail(id);
    return res.status(200).json(result);
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
    const result = await adminPaymentService.createPayment(req.body);
    return res.status(201).json(result);
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

    if (isNaN(id)) {
      throw createError({
        message: "Valid Payment ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminPaymentService.updatePayment(id, req.body);
    return res.status(200).json(result);
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
      throw createError({
        message: "Valid Payment ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminPaymentService.voidPayment(id);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const verifyPayment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      throw createError({
        message: "Valid Payment ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    let result;
    if (status === "SUCCESS") {
      result = await adminPaymentService.approvePayment(id);
    } else if (status === "FAILED") {
      result = await adminPaymentService.rejectPayment(id);
    } else {
      throw createError({
        message: "Invalid status update. Only SUCCESS or FAILED are allowed.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
