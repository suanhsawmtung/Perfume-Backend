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
  cursor?: number | string | null | undefined;
  limit?: number | string | null | undefined;
};

export type CursorPaginationResultT<T> = {
  items: T[];
  nextCursor: number | null;
  totalCount: number;
};

export type SelectOptionT = {
  id: number;
  name: string;
  slug: string;
}


