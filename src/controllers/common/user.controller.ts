import { NextFunction, Response } from "express";
import { listPublicUsers as listPublicUsersService } from "../../services/user/user.service";
import { CustomRequest } from "../../types/common";

export const listPublicUsers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string, 10) : undefined;

    const users = await listPublicUsersService(limit, cursor);

    const nextCursor =
      limit && users.length > 0 ? users[users.length - 1]?.id : null;

    res.status(200).json({
      success: true,
      data: {
        users,
        nextCursor,
      },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};
