import { Otp, OtpType, Prisma } from "@prisma/client";
import { authProcessErrorCode, errorCode } from "../../config/error-code";
import { hash } from "../../lib/hash";
import { prisma } from "../../lib/prisma";
import { generateOTP, generateToken } from "../../lib/unique-key-generator";
import { SafeUserT } from "../../types/user";
import { createError } from "../../utils/common";
import { userOmit } from "../user/user.helpers";

export interface IRefreshOrCreateOtpResponse {
  otp: string;
  result: Otp;
}

export const getOtpByEmail = async ({
  email,
  type,
}: {
  email: string;
  type: OtpType;
}): Promise<Otp | null> => {
  return await prisma.otp.findUnique({
    where: { email, type },
  });
};

export const createOtp = async (createOtpData: Prisma.OtpCreateInput): Promise<Otp> => {
  return await prisma.otp.create({
    data: createOtpData,
  });
};

export const updateOtp = async (
  id: number,
  updateOtpData: Prisma.OtpUpdateInput,
): Promise<Otp> => {
  return await prisma.otp.update({
    where: { id },
    data: updateOtpData,
  });
};

export const refreshOrCreateOtp = async ({ email, type, verifiedAt = null }: {
  email: string;
  type: OtpType;
  verifiedAt?: Date | null;
}): Promise<IRefreshOrCreateOtpResponse> => {
  const otp = generateOTP();
  const token = generateToken();
  const hashedOtp = await hash(otp.toString());

  const otpRow = await getOtpByEmail({ email, type });

  let result;

  if (otpRow) {
    result = await updateOtp(otpRow.id, {
      otp: hashedOtp,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 2),
      verifiedAt,
    });
  } else {
    result = await createOtp({
      email,
      otp: hashedOtp,
      token,
      type,
      expiresAt: new Date(Date.now() + 1000 * 60 * 2),
      verifiedAt,
    });
  }

  return {
    otp: otp.toString(),
    result,
  };
};

export const deleteOtp = async ({ email, type }: { email: string, type: OtpType }): Promise<Otp> => {
  return await prisma.otp.delete({
    where: { email, type },
  });
};

export const userNotExistsError = (): Error => {
  return createError({
    message: "This user does not exist.",
    status: 404,
    code: authProcessErrorCode.userNotFound,
  });
};

export const verifiedUserAlreadyExistsError = (): Error => {
  return createError({
    message: "This email address has already been registered.",
    status: 409,
    code: authProcessErrorCode.userAlreadyExists,
  });
};

export const userNotVerifiedError = (): Error => {
  return createError({
    message: "This user is not verified. Please verify your email first.",
    status: 403,
    code: authProcessErrorCode.userNotVerified,
  });
};

export const otpNotExistError = (): Error => {
  return createError({
    message: "OTP does not exist for this email address.",
    status: 400,
    code: authProcessErrorCode.otpNotExist,
  });
};

export const otpNotVerifiedError = (): Error => {
  return createError({
    message: "OTP is not verified.",
    status: 400,
    code: authProcessErrorCode.otpNotVerified,
  });
};

export const invalidTokenError = (): Error => {
  return createError({
    message: "Invalid token!",
    status: 400,
    code: authProcessErrorCode.invalidToken,
  });
};

export const unmatchedOtpError = (): Error => {
  return createError({
    message: "Otp is incorrect!",
    status: 400,
    code: authProcessErrorCode.invalidOrWrongOtp,
  });
};

export const expiredOtpError = (): Error => {
  return createError({
    message: "Otp is expired!",
    status: 400,
    code: authProcessErrorCode.expiredOtp,
  });
};

export const invalidPasswordError = (): Error => {
  return createError({
    message: "Invalid password!",
    status: 400,
    code: authProcessErrorCode.invalidPassword,
  });
};

export const unauthenticatedError = (): Error => {
  return createError({
    message: "You are not an authenticated user.",
    status: 401,
    code: errorCode.unauthenticated,
  });
};

export const invalidRefreshTokenError = (): Error => {
  return createError({
    message: "Refresh Token is invalid.",
    status: 400,
    code: errorCode.attack,
  });
};

export const retryAndLogoutError = (): Error => {
  return createError({
    message: "You are not an authenticated user.",
    status: 401,
    code: errorCode.retryAndLogout,
  });
};

export const invalidGoogleProfileError = (): Error => {
  return createError({
    message: "Invalid Google profile!",
    status: 400,
    code: authProcessErrorCode.invalidGoogleProfile,
  });
};

export const findUserByGoogleId = async (googleId: string): Promise<SafeUserT | null> => {
  return await prisma.user.findUnique({
    where: { googleId },
    omit: userOmit,
  }) as SafeUserT | null;
};


