import { Request } from "express";

export interface CustomRequest extends Request {
  userId?: number;
}

export interface ServiceResponseT<T> {
  data: T;
  success: boolean;
  message: string | null;
}


