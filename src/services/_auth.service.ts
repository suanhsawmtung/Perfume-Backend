// import { Otp, Prisma, User } from "@prisma/client";
// import { authProcessErrorCode, errorCode } from "../../config/error-code";
// import { hash } from "../lib/hash";
// import { prisma } from "../lib/prisma";
// import { generateOTP, generateToken } from "../lib/unique-key-generator";
// import { checkOtpErrorCountLimits, handleExpiredOtp } from "../utils/auth";
// import { createError, isToday } from "../utils/common";
// import { updateUserRecord } from "./user/user.helpers";

// type UserWithoutSensitive = Omit<
//   User,
//   "password" | "randToken" | "errorLoginCount"
// >;

// export const getOtpByEmail = async (email: string) => {
//   return await prisma.otp.findUnique({
//     where: { email },
//   });
// };

// export const createOtp = async (createOtpData: Prisma.OtpCreateInput) => {
//   return await prisma.otp.create({
//     data: createOtpData,
//   });
// };

// export const updateOtp = async (
//   id: number,
//   updateOtpData: Prisma.OtpUpdateInput
// ) => {
//   return await prisma.otp.update({
//     where: { id },
//     data: updateOtpData,
//   });
// };

// export const throwIfOtpNotExists = (otp: Otp | null): Otp => {
//   if (!otp) {
//     const error = createError({
//       message: "OTP does not exist for this email address.",
//       status: 400,
//       code: authProcessErrorCode.otpNotExist,
//     });

//     throw error;
//   }

//   return otp;
// };

// export const throwIfOtpNotVerified = (otp: Otp) => {
//   if (!otp.verifyToken) {
//     const error = createError({
//       message: "OTP has not been verified for this email address.",
//       status: 400,
//       code: authProcessErrorCode.otpNotVerified,
//     });

//     throw error;
//   }
// };

// export const handleInvalidToken = async (otp: Otp) => {
//   await updateOtp(otp.id, {
//     error: 5,
//   });

//   const error = createError({
//     message: "Invalid token!",
//     status: 400,
//     code: authProcessErrorCode.invalidToken,
//   });

//   throw error;
// };

// export const handleExpiredVerifyToken = async (otp: Otp) => {
//   await updateOtp(otp.id, {
//     verifyToken: null,
//   });

//   handleExpiredOtp();
// };

// export const handleUnmatchedOtp = async (
//   otp: Otp,
//   isLastOtpUpdatedToday: boolean
// ) => {
//   const otpUpdateData = isLastOtpUpdatedToday
//     ? {
//         error: {
//           increment: 1,
//         },
//       }
//     : {
//         error: 1,
//       };

//   await updateOtp(otp!.id, otpUpdateData);

//   const error = createError({
//     message: "Otp is incorrect!",
//     status: 400,
//     code: authProcessErrorCode.invalidOrWrongOtp,
//   });

//   throw error;
// };

// export const checkOtpLimits = (otpRow: Otp) => {
//   checkOtpErrorCountLimits(otpRow.error);

//   if (otpRow.count === 3) {
//     const error = createError({
//       message: "OTP is allowed to request 3 times per day",
//       status: 429,
//       code: authProcessErrorCode.otpCountLimitExceeded,
//     });

//     throw error;
//   }
// };

// export const refreshOtp = async ({
//   newOtp,
//   newToken,
//   currentOtpData,
// }: {
//   newOtp: string;
//   newToken: string;
//   currentOtpData: Otp;
// }) => {
//   let result;
//   if (isToday(currentOtpData.updatedAt)) {
//     checkOtpLimits(currentOtpData);

//     result = await updateOtp(currentOtpData.id, {
//       otp: newOtp,
//       rememberToken: newToken,
//       verifyToken: null,
//       count: {
//         increment: 1,
//       },
//     });
//   } else {
//     result = await updateOtp(currentOtpData.id, {
//       otp: newOtp,
//       rememberToken: newToken,
//       verifyToken: null,
//       count: 1,
//       error: 0,
//     });
//   }

//   return result;
// };

// export const refreshOrCreateOtp = async (email: string) => {
//   const otp = generateOTP();
//   const token = generateToken();
//   const hashedOtp = await hash(otp.toString());

//   const otpRow = await getOtpByEmail(email);

//   let result;

//   if (otpRow) {
//     result = await refreshOtp({
//       newOtp: hashedOtp,
//       newToken: token,
//       currentOtpData: otpRow,
//     });
//   } else {
//     result = await createOtp({
//       email,
//       otp: hashedOtp,
//       rememberToken: token,
//     });
//   }

//   // TODO: Send OTP via email
//   // OTP sending logic here
//   // Generate OTP & call email OTP sending API
//   // If email OTP cannot be sent, response error

//   return { result, otp, token };
// };

// export const throwIfUserExists = async (user: User | null) => {
//   if (user) {
//     const error = createError({
//       message: "This email address has already been registered.",
//       status: 409,
//       code: authProcessErrorCode.userAlreadyExists,
//     });

//     throw error;
//   }
// };

// export const throwIfUserNotExists = (user: User | null): User => {
//   if (!user) {
//     const error = createError({
//       message: "This user does not exist.",
//       status: 404,
//       code: authProcessErrorCode.userNotFound,
//     });

//     throw error;
//   }

//   return user;
// };

// export const throwIfUserNotExistsWithoutSensitive = (
//   user: UserWithoutSensitive | null
// ): UserWithoutSensitive => {
//   if (!user) {
//     const error = createError({
//       message: "This user does not exist.",
//       status: 404,
//       code: errorCode.notFound,
//     });

//     throw error;
//   }

//   return user;
// };

// export const throwIfUserIsFreeze = (user: User) => {
//   if (user.status === "FREEZE") {
//     const error = createError({
//       message: "Your account is temporarily locked.",
//       status: 423,
//       code: errorCode.accountFreeze,
//     });

//     throw error;
//   }
// };

// export const reactivateUserIfNotActive = async (user: User) => {
//   if (user.status !== "ACTIVE") {
//     await updateUserRecord(user.id, { status: "ACTIVE" });
//   }
// };
