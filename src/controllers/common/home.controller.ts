import { NextFunction, Response } from "express";
import { HomeService } from "../../services/home/home.service";
import { CustomRequest } from "../../types/common";

const homeService = new HomeService();

export const getHome = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const { gender } = req.query;
    const result = await homeService.getHomeData(userId, gender as string);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
