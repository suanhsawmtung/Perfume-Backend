// import { NextFunction, Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import moment from "moment";
// import { compareHashed, hash } from "../lib/hash";
// import { generateJWT, generateToken } from "../lib/unique-key-generator";
// import {
//   getOtpByEmail,
//   handleExpiredVerifyToken,
//   handleInvalidToken,
//   handleUnmatchedOtp,
//   reactivateUserIfNotActive,
//   refreshOrCreateOtp,
//   throwIfOtpNotExists,
//   throwIfOtpNotVerified,
//   throwIfUserExists,
//   throwIfUserIsFreeze,
//   throwIfUserNotExists,
//   updateOtp,
// } from "../services/auth.service";
// import { createUserRecord, findUserByEmail, findUserById, findUserByIdWithSensitive, generateUsername, updateUserRecord } from "../services/user/user.helpers";
// import { CustomRequest } from "../types/common";
// import {
//   checkOtpErrorCountLimits,
//   handleExpiredOtp,
//   throwIfUnauthenticated,
//   throwInvalidCredentialsError,
// } from "../utils/auth";
// import { isToday } from "../utils/common";

// export const register = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const email = req.body.email.trim().toLowerCase();

//   const user = await findUserByEmail(email);
//   await throwIfUserExists(user);

//   const { result, otp, token } = await refreshOrCreateOtp(email);

//   res.status(200).json({
//     message: `We are sending OTP to ${result.email}`,
//     data: {
//       email: result.email,
//       token: result.rememberToken,
//     },
//     success: true,
//   });
// };

// export const verifyOtp = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { email, otp, token } = req.body;
//   const normalizedEmail = email.trim().toLowerCase();

//   const user = await findUserByEmail(normalizedEmail);
//   throwIfUserExists(user);

//   const otpRow = throwIfOtpNotExists(await getOtpByEmail(normalizedEmail));

//   const isLastOtpUpdatedToday = isToday(otpRow.updatedAt);

//   if (isLastOtpUpdatedToday) checkOtpErrorCountLimits(otpRow.error);

//   const isTokenInvalid = token !== otpRow.rememberToken;
//   if (isTokenInvalid) await handleInvalidToken(otpRow);

//   const isMatched = await compareHashed(otp, otpRow.otp);
//   if (!isMatched) await handleUnmatchedOtp(otpRow, isLastOtpUpdatedToday);

//   const isExpired = moment().diff(otpRow.updatedAt, "minutes") > 2;
//   if (isExpired) handleExpiredOtp();

//   const verifyToken = generateToken();
//   const result = await updateOtp(otpRow.id, {
//     error: 0,
//     count: 1,
//     verifyToken,
//   });

//   res.status(200).json({
//     message: "OTP is successfully verified.",
//     data: {
//       email: result.email,
//       token: result.verifyToken,
//     },
//     success: true,
//   });
// };

// export const confirmPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { email, password, token } = req.body;
//   const normalizedEmail = email.trim().toLowerCase();

//   const user = await findUserByEmail(normalizedEmail);
//   await throwIfUserExists(user);

//   const otpRow = throwIfOtpNotExists(await getOtpByEmail(normalizedEmail));

//   throwIfOtpNotVerified(otpRow);

//   const isLastOtpUpdatedToday = isToday(otpRow.updatedAt);

//   if (isLastOtpUpdatedToday) checkOtpErrorCountLimits(otpRow.error);

//   if (otpRow.verifyToken !== token) await handleInvalidToken(otpRow);

//   const isExpired = moment().diff(otpRow.updatedAt, "minutes") > 2;
//   if (isExpired) await handleExpiredVerifyToken(otpRow);

//   // Generate username from firstName and lastName (both null during registration)
//   const username = await generateUsername(null, null);

//   const randToken = generateToken();
//   const newUser = await createUserRecord({
//     email: normalizedEmail,
//     username,
//     firstName: null,
//     lastName: null,
//     phone: null,
//     password: await hash(password),
//     randToken,
//   });

//   const accessToken = generateJWT({
//     payload: { id: newUser.id },
//     secret: process.env.ACCESS_TOKEN_SECRET_KEY!,
//     options: { expiresIn: 60 * 15 },
//   });

//   const refreshToken = generateJWT({
//     payload: { id: newUser.id, email: newUser.email },
//     secret: process.env.REFRESH_TOKEN_SECRET_KEY!,
//     options: { expiresIn: "30d" },
//   });

//   const updatedUser = await updateUserRecord(newUser.id, {
//     randToken: refreshToken,
//   });

//   const userData = {
//     id: updatedUser.id,
//     email: updatedUser.email,
//     username: updatedUser.username,
//     firstName: updatedUser.firstName,
//     lastName: updatedUser.lastName,
//     phone: updatedUser.phone,
//     role: updatedUser.role,
//     status: updatedUser.status,
//     lastLogin: updatedUser.lastLogin,
//     image: updatedUser.image,
//     createdAt: updatedUser.createdAt,
//     updatedAt: updatedUser.updatedAt,
//   };

//   res
//     .cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: process.env.APP_ENV === "production",
//       sameSite: process.env.APP_ENV === "production" ? "none" : "strict",
//       maxAge: 1000 * 60 * 15,
//     })
//     .cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.APP_ENV === "production",
//       sameSite: process.env.APP_ENV === "production" ? "none" : "strict",
//       maxAge: 1000 * 60 * 60 * 24 * 30,
//     })
//     .status(201)
//     .json({
//       message: "Successfully create an account.",
//       data: userData,
//       success: true,
//     });
// };

// export const login = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const email = req.body.email.trim().toLowerCase();
//   const password = req.body.password;

//   const user = throwIfUserNotExists(await findUserByEmail(email));

//   const isLastUserUpdatedToday = isToday(user.updatedAt);

//   if (isLastUserUpdatedToday) {
//     throwIfUserIsFreeze(user);
//   } else {
//     reactivateUserIfNotActive(user);
//   }

//   const isMatched = await compareHashed(password, user.password);
//   if (!isMatched) {
//     if (isLastUserUpdatedToday) {
//       if (user.errorLoginCount >= 3) {
//         await updateUserRecord(user.id, { status: "FREEZE" });
//       } else {
//         await updateUserRecord(user.id, {
//           errorLoginCount: { increment: 1 },
//         });
//       }
//     } else {
//       await updateUserRecord(user.id, { errorLoginCount: 1 });
//     }

//     throwInvalidCredentialsError();
//   }

//   const accessToken = generateJWT({
//     payload: { id: user.id },
//     secret: process.env.ACCESS_TOKEN_SECRET_KEY!,
//     options: { expiresIn: 60 * 15 },
//   });

//   const refreshToken = generateJWT({
//     payload: { id: user.id, email: user.email },
//     secret: process.env.REFRESH_TOKEN_SECRET_KEY!,
//     options: { expiresIn: "30d" },
//   });

//   const updatedUser = await updateUserRecord(user.id, {
//     randToken: refreshToken,
//     errorLoginCount: 0,
//   });

//   const userData = {
//     id: updatedUser.id,
//     email: updatedUser.email,
//     username: updatedUser.username,
//     firstName: updatedUser.firstName,
//     lastName: updatedUser.lastName,
//     phone: updatedUser.phone,
//     role: updatedUser.role,
//     status: updatedUser.status,
//     lastLogin: updatedUser.lastLogin,
//     image: updatedUser.image,
//     createdAt: updatedUser.createdAt,
//     updatedAt: updatedUser.updatedAt,
//   };

//   res
//     .cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: process.env.APP_ENV === "production",
//       sameSite: process.env.APP_ENV === "production" ? "none" : "strict",
//       maxAge: 1000 * 60 * 15,
//     })
//     .cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.APP_ENV === "production",
//       sameSite: process.env.APP_ENV === "production" ? "none" : "strict",
//       maxAge: 1000 * 60 * 60 * 24 * 30,
//     })
//     .status(200)
//     .json({
//       success: true,
//       message: "Successfully login",
//       data: userData,
//     });
// };

// export const logout = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const refreshToken = req.cookies?.refreshToken;

//   if (!refreshToken) {
//     throwIfUnauthenticated();
//   }

//   let decoded;

//   try {
//     decoded = jwt.verify(
//       refreshToken,
//       process.env.REFRESH_TOKEN_SECRET_KEY!
//     ) as { id: number; email: string };
//   } catch {
//     throwIfUnauthenticated();
//   }

//   if (!decoded) return;

//   if (isNaN(decoded.id)) {
//     throwIfUserNotExists(null);
//   }

//   const user = throwIfUserNotExists(await findUserByIdWithSensitive(decoded.id));

//   if (user.randToken !== refreshToken || user.id !== decoded.id) {
//     throwIfUnauthenticated();
//   }

//   await updateUserRecord(user.id, { randToken: generateToken() });

//   res
//     .clearCookie("accessToken", {
//       httpOnly: true,
//       secure: process.env.APP_ENV === "production",
//       sameSite: process.env.APP_ENV === "production" ? "none" : "strict",
//     })
//     .clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: process.env.APP_ENV === "production",
//       sameSite: process.env.APP_ENV === "production" ? "none" : "strict",
//     })
//     .status(200)
//     .json({ message: "Successfully logged out." });
// };

// export const forgotPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const email = req.body.email.trim().toLowerCase();

//   throwIfUserNotExists(await findUserByEmail(email));

//   const { result, otp, token } = await refreshOrCreateOtp(email);

//   res.status(200).json({
//     message: `We are sending OTP to ${result.email}`,
//     success: true,
//     data: {
//       email: result.email,
//       token: result.rememberToken,
//     },
//   });
// };

// export const resendOtp = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const email = req.body.email.trim().toLowerCase();

//   const { result, otp, token } = await refreshOrCreateOtp(email);

//   res.status(200).json({
//     message: `We are sending OTP to ${result.email}`,
//     success: true,
//     data: {
//       email: result.email,
//       token: result.rememberToken,
//     },
//   });
// };

// export const verifyPasswordOtp = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { email, otp, token } = req.body;
//   const normalizedEmail = email.trim().toLowerCase();

//   throwIfUserNotExists(await findUserByEmail(normalizedEmail));

//   const otpRow = throwIfOtpNotExists(await getOtpByEmail(normalizedEmail));

//   const isLastOtpUpdatedToday = isToday(otpRow.updatedAt);

//   if (isLastOtpUpdatedToday) checkOtpErrorCountLimits(otpRow.error);

//   const isTokenInvalid = token !== otpRow.rememberToken;
//   if (isTokenInvalid) await handleInvalidToken(otpRow);

//   const isMatched = await compareHashed(otp, otpRow.otp);
//   if (!isMatched) await handleUnmatchedOtp(otpRow, isLastOtpUpdatedToday);

//   const isExpired = moment().diff(otpRow.updatedAt, "minutes") > 2;
//   if (isExpired) handleExpiredOtp();

//   const verifyToken = generateToken();
//   const result = await updateOtp(otpRow.id, {
//     error: 0,
//     count: 1,
//     verifyToken,
//   });

//   res.status(200).json({
//     message: "OTP is successfully verified.",
//     data: {
//       email: result.email,
//       token: result.verifyToken,
//     },
//     success: true,
//   });
// };

// export const resetPassword = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { email, password, token } = req.body;
//   const normalizedEmail = email.trim().toLowerCase();

//   const user = throwIfUserNotExists(await findUserByEmail(normalizedEmail));

//   const otpRow = throwIfOtpNotExists(await getOtpByEmail(normalizedEmail));

//   throwIfOtpNotVerified(otpRow);

//   const isLastOtpUpdatedToday = isToday(otpRow.updatedAt);

//   if (isLastOtpUpdatedToday) checkOtpErrorCountLimits(otpRow.error);

//   if (otpRow.verifyToken !== token) await handleInvalidToken(otpRow);

//   const isExpired = moment().diff(otpRow.updatedAt, "minutes") > 2;
//   if (isExpired) await handleExpiredVerifyToken(otpRow);

//   await updateUserRecord(user.id, {
//     password: await hash(password),
//   });

//   res.status(200).json({
//     message: "Successfully reset your account password.",
//     data: null,
//     success: true,
//   });
// };

// export const checkAuth = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.userId;

//   if (!userId) {
//     return res.status(200).json({
//       success: false,
//       data: null,
//       message: "User ID not found.",
//     });
//   }

//   const user = await findUserById(userId);

//   if (!user) {
//     return res.status(200).json({
//       success: false,
//       data: null,
//       message: "User not found.",
//     });
//   }

//   return res.status(200).json({
//     success: true,
//     data: user,
//     message: "User is authenticated.",
//   });
// };
