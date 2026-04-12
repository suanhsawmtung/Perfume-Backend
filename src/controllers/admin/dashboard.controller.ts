import { NextFunction, Response } from "express";
import { DashboardService } from "../../services/dashboard/dashboard.service";
import { CustomRequest } from "../../types/common";

const dashboardService = new DashboardService();

export const getDashboardData = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await dashboardService.getDashboardData(req.query);

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};