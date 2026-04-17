import { OtpType } from "@prisma/client";
import "dotenv/config";
import jwt from "jsonwebtoken";
import moment from "moment";
import { env } from "../../../config/env";
import { compareHashed, hash } from "../../lib/hash";
import { generateJWT } from "../../lib/unique-key-generator";
import {
    IForgotPasswordData,
    ILoginData,
    IRegistrationData,
    IResendOtpData,
    IVerifyResetOtpData
} from "../../types/auth";
import { ServiceResponseT } from "../../types/common";
import { SafeUserT } from "../../types/user";
import { EmailService } from "../email/email.service";
import {
    createUserRecord,
    findUserByEmail,
    findUserByEmailWithSensitive,
    findUserById,
    findUserByIdWithSensitive,
    generateUsername,
    updateUserRecord
} from "../user/user.helpers";
import {
    deleteOtp,
    expiredOtpError,
    getOtpByEmail,
    invalidPasswordError,
    invalidTokenError,
    otpNotExistError,
    otpNotVerifiedError,
    refreshOrCreateOtp,
    unauthenticatedError,
    unmatchedOtpError,
    updateOtp,
    userNotExistsError,
    userNotVerifiedError,
    verifiedUserAlreadyExistsError
} from "./auth.helpers";
import { IAuthService } from "./auth.interface";

export class AuthService implements IAuthService {
    private emailService = new EmailService();

    async register({ 
        email, 
        password, 
        firstName,
        lastName 
    }: { 
        email: string; 
        password: string; 
        firstName: string;
        lastName: string;
    }): Promise<ServiceResponseT<IRegistrationData>> {
        const user = await findUserByEmail(email);
        if (user && user.emailVerifiedAt) {
            throw verifiedUserAlreadyExistsError();
        }

        if (user && !user.emailVerifiedAt) {
            const { otp, result } = await refreshOrCreateOtp({ 
                email, 
                type: OtpType.VERIFY_EMAIL,
                verifiedAt: new Date(),
            });

            await this.emailService.sendOtpEmail(email, otp);

            return {
                data: result,
                success: true,
                message: "OTP sent successfully",
            };
        }

        const newUser = await createUserRecord({
            email,
            username: await generateUsername(firstName, lastName),
            firstName,
            lastName,
            password: await hash(password), 
        });

        const { otp, result } = await refreshOrCreateOtp({
            email: newUser.email,
            type: OtpType.VERIFY_EMAIL,
            verifiedAt: new Date(),
        });

        await this.emailService.sendOtpEmail(email, otp);

        return {
            data: {
                email: result.email,
                token: result.token,
            },
            success: true,
            message: `We sent OTP to ${result.email}`,
        };
    }

    async verifyUserEmail({ 
        email, 
        otp, 
        token, 
    }: { 
        email: string, 
        otp: string, 
        token: string, 
    }): Promise<ServiceResponseT<ILoginData>> {
        const user = await findUserByEmail(email);
        if(!user) {
            throw userNotExistsError();
        }

        if(user.emailVerifiedAt) {
            throw verifiedUserAlreadyExistsError();
        }

        const otpRow = await getOtpByEmail({ email, type: OtpType.VERIFY_EMAIL });
        if(!otpRow) {
            throw otpNotExistError();
        }

        const isTokenInvalid = token !== otpRow.token;
        if (isTokenInvalid) {
            throw invalidTokenError();
        };

        const isMatched = await compareHashed(otp, otpRow.otp);
        if (!isMatched) throw unmatchedOtpError();

        const isExpired = moment().diff(otpRow.expiresAt, "minutes") > 2;
        if (isExpired) throw expiredOtpError();

        const accessToken = generateJWT({
            payload: { id: user.id },
            secret: env.jwt.accessTokenSecret,
            options: { expiresIn: 60 * 15 },
        });

        const refreshToken = generateJWT({
            payload: { id: user.id, email: user.email },
            secret: env.jwt.refreshTokenSecret,
            options: { expiresIn: "30d" },
        });

        const updatedUser = await updateUserRecord(user.id, {
            refreshToken,
            emailVerifiedAt: new Date(),
        });

        await deleteOtp({ email, type: OtpType.VERIFY_EMAIL });

        return {
            data: {
                accessToken,
                refreshToken,
                userData: updatedUser,
            },
            success: true,
            message: "User verified successfully",
        };
    }

    async login({ email, password }: { email: string, password: string }): Promise<ServiceResponseT<ILoginData>> {
        const user = await findUserByEmailWithSensitive(email);
        if(!user) {
            throw userNotExistsError();
        }

        if(!user.emailVerifiedAt) {
            throw userNotVerifiedError();
        }

        const isMatched = await compareHashed(password, user.password || "");
        if (!isMatched) throw invalidPasswordError();

        const accessToken = generateJWT({
            payload: { id: user.id },
            secret: env.jwt.accessTokenSecret,
            options: { expiresIn: 60 * 15 },
        });

        const refreshToken = generateJWT({
            payload: { id: user.id, email: user.email },
            secret: env.jwt.refreshTokenSecret,
            options: { expiresIn: "30d" },
        });

        const updatedUser = await updateUserRecord(user.id, {
            refreshToken,
        });

        return {
            data: {
                accessToken,
                refreshToken,
                userData: updatedUser,
            },
            success: true,
            message: "User logged in successfully",
        };
    }

    async logout({ refreshToken }: { refreshToken: string }): Promise<ServiceResponseT<null>> {
        if (!refreshToken) {
            throw unauthenticatedError();
        }

        let decoded;

        try {
            decoded = jwt.verify(
            refreshToken,
            env.jwt.refreshTokenSecret
            ) as { id: number; email: string };
        } catch {
            throw unauthenticatedError();
        }

        if (!decoded) return { 
            data: null, 
            success: true, 
            message: "User logged out successfully" 
        };

        if (isNaN(decoded.id)) {
            throw userNotExistsError();
        }

        const user = await findUserByIdWithSensitive(decoded.id);
        if(!user) {
            throw userNotExistsError();
        }

        if (user.refreshToken !== refreshToken || user.id !== decoded.id) {
            throw unauthenticatedError();
        }

        await updateUserRecord(user.id, { 
            refreshToken: null,
            previousRefreshToken: null,
            rotateTokenAt: null,
        });

        return {
            data: null,
            success: true,
            message: "User logged out successfully",
        };
    }

    async forgotPassword({ email }: { email: string }): Promise<ServiceResponseT<IForgotPasswordData>> {
        const user = await findUserByEmail(email);

        if(!user) {
            throw userNotExistsError();
        }

        if(!user.emailVerifiedAt) {
            throw userNotVerifiedError();
        }

        const { otp, result } = await refreshOrCreateOtp({
            email,
            type: OtpType.RESET_PASSWORD,
        });

        await this.emailService.sendOtpEmail(email, otp);

        return {
            data: {
                email: result.email,
                token: result.token,
            },
            success: true,
            message: `We sent OTP to ${result.email}`,
        };
    }

    async resendOtp({ email, type }: { email: string, type: OtpType }): Promise<ServiceResponseT<IResendOtpData>> {
        const user = await findUserByEmail(email);

        if(!user) {
            throw userNotExistsError();
        }

        if(!user.emailVerifiedAt && type === OtpType.RESET_PASSWORD) {
            throw userNotVerifiedError();
        }

        const { otp, result } = await refreshOrCreateOtp({
            email,
            type,
        });

        await this.emailService.sendOtpEmail(email, otp);

        return {
            data: {
                email: result.email,
                token: result.token,
            },
            success: true,
            message: `We sent OTP to ${result.email}`,
        };
    }

    async verifyResetPasswordOtp({ 
        email, 
        otp, 
        token, 
    }: { 
        email: string, 
        otp: string, 
        token: string, 
    }): Promise<ServiceResponseT<IVerifyResetOtpData>> {
        const user = await findUserByEmail(email);
        if(!user) {
            throw userNotExistsError();
        }

        if(!user.emailVerifiedAt) {
            throw userNotVerifiedError();
        }

        const otpRow = await getOtpByEmail({ email, type: OtpType.RESET_PASSWORD });
        if(!otpRow) {
            throw otpNotExistError();
        }

        const isTokenInvalid = token !== otpRow.token;
        if (isTokenInvalid) {
            throw invalidTokenError();
        };

        const isMatched = await compareHashed(otp, otpRow.otp);
        if (!isMatched) throw unmatchedOtpError();

        const isExpired = moment().diff(otpRow.expiresAt, "minutes") > 2;
        if (isExpired) throw expiredOtpError();

        const result = await updateOtp(otpRow.id, {
            verifiedAt: new Date(),
        });

        return {
            data: {
                email: result.email,
                token: result.token,
            },
            success: true,
            message: "OTP is successfully verified.",
        };
    }

    async resetPassword({ email, password, token }: {
        email: string;
        password: string;
        token: string;
    }): Promise<ServiceResponseT<SafeUserT>> {
        const user = await findUserByEmail(email);
        if(!user) {
            throw userNotExistsError();
        }

        if(!user.emailVerifiedAt) {
            throw userNotVerifiedError();
        }

        const otpRow = await getOtpByEmail({ email, type: OtpType.RESET_PASSWORD });
        if(!otpRow) {
            throw otpNotExistError();
        }

        if(!otpRow.verifiedAt) {
            throw otpNotVerifiedError();
        }

        const isTokenInvalid = token !== otpRow.token;
        if (isTokenInvalid) {
            throw invalidTokenError();
        };

        const isExpired = moment().diff(otpRow.expiresAt, "minutes") > 2;
        if (isExpired) {
            await updateOtp(otpRow.id, { verifiedAt: null });
            throw expiredOtpError();
        }

        const result = await updateUserRecord(user.id, {
            password: await hash(password),
        });

        return {
            data: result,
            success: true,
            message: "Successfully reset your account password.",
        };
    }

    async checkAuth(userId?: number | undefined): Promise<ServiceResponseT<
        SafeUserT | null
    >> {
        if (!userId) {
            return {
                success: false,
                data: null,
                message: "User ID not found.",
            };
        }

        const user = await findUserById(userId);
        
        if(!user) {
            return {
                data: null,
                success: false,
                message: "User not found.",
            };
        }

        return {
            success: true,
            data: user as SafeUserT,
            message: "User is authenticated.",
        };
    }
}
