import { SafeUserT } from "./user";

export interface IRegistrationData {
  email: string;
  token: string | null;
}

export interface ILoginData {
  accessToken: string;
  refreshToken: string;
  userData: SafeUserT;
}

export interface IForgotPasswordData {
  email: string;
  token: string | null;
}

export interface IResendOtpData {
  email: string;
  token: string | null;
}

export interface IVerifyResetOtpData {
  email: string;
  token: string | null;
}
