import { OtpType } from "@prisma/client";
import {
  IForgotPasswordData,
  ILoginData,
  IRegistrationData,
  IResendOtpData,
  IVerifyResetOtpData
} from "../../types/auth";
import { ServiceResponseT } from "../../types/common";
import { SafeUserT } from "../../types/user";

export interface IAuthService {
  register(params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ServiceResponseT<IRegistrationData>>;

  verifyUserEmail(params: {
    email: string;
    otp: string;
    token: string;
  }): Promise<ServiceResponseT<ILoginData>>;

  login(params: {
    email: string;
    password: string;
  }): Promise<ServiceResponseT<ILoginData>>;

  logout(params: {
    refreshToken: string;
  }): Promise<ServiceResponseT<null>>;

  forgotPassword(params: {
    email: string;
  }): Promise<ServiceResponseT<IForgotPasswordData>>;

  resendOtp(params: {
    email: string;
    type: OtpType;
  }): Promise<ServiceResponseT<IResendOtpData>>;

  verifyResetPasswordOtp(params: {
    email: string;
    otp: string;
    token: string;
  }): Promise<ServiceResponseT<IVerifyResetOtpData>>;

  resetPassword(params: {
    email: string;
    password: string;
    token: string;
  }): Promise<ServiceResponseT<SafeUserT>>;

  // refreshTokens(params: {
  //   refreshToken: string;
  // }): Promise<ServiceResponseT<ILoginData>>;

  checkAuth(userId?: number | undefined): Promise<ServiceResponseT<
        SafeUserT | null
    >>;
}
