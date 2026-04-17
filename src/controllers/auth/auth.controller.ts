import { NextFunction, Request, Response } from "express";
import { env } from "../../../config/env";
import { AuthService } from "../../services/auth/auth.service";
import { CustomRequest } from "../../types/common";

const authService = new AuthService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, firstName, lastName } = req.body;

  const result = await authService.register({ email, password, firstName, lastName });

  return res.status(200).json(result);
};

export const verifyUserEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, otp, token } = req.body;

  const { data: { 
    accessToken, 
    refreshToken, 
    userData 
  }} = await authService.verifyUserEmail({ email, otp, token });

  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env.appEnv === "production",
      sameSite: env.appEnv === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 15,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.appEnv === "production",
      sameSite: env.appEnv === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    })
    .status(200)
    .json({
      message: "User is successfully verified.",
      data: userData,
      success: true,
    });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  const { data: { 
    accessToken, 
    refreshToken, 
    userData 
  }} = await authService.login({ email, password });

  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env.appEnv === "production",
      sameSite: env.appEnv === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 15,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.appEnv === "production",
      sameSite: env.appEnv === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    })
    .status(200)
    .json({
      success: true,
      message: "Successfully login",
      data: userData,
    });
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies?.refreshToken;

  await authService.logout({ refreshToken });

  return res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: env.appEnv === "production",
      sameSite: env.appEnv === "production" ? "none" : "strict",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.appEnv === "production",
      sameSite: env.appEnv === "production" ? "none" : "strict",
    })
    .status(200)
    .json({ message: "Successfully logged out." });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email;

  const result = await authService.forgotPassword({ email });

  return res.status(200).json(result);
};

export const resendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, type } = req.body;

  const result = await authService.resendOtp({ email, type });

  return res.status(200).json(result);
};

export const verifyResetPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, otp, token } = req.body;

  const result = await authService.verifyResetPasswordOtp({
    email,
    otp,
    token,
  });

  return res.status(200).json(result);
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, token } = req.body;

  const result = await authService.resetPassword({ email, password, token });

  return res.status(200).json(result);
};

export const checkAuth = async (
  req: CustomRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.userId;

  const result = await authService.checkAuth(userId);

  return res.status(200).json(result);
};