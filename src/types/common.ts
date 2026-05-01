import { Request } from "express";

export interface CustomRequest extends Request {
  userId?: number;
}

export interface ServiceResponseT<T> {
  data: T;
  success: boolean;
  message: string | null;
}

export type CursorPaginationParams = {
  cursor?: number | string;
  limit?: number | string;
};

export type CursorPaginationResultT<T> = {
  items: T[];
  nextCursor: number | null;
};


