import crypto from "crypto";
import { UserRepository } from "../repositories/user.repository";
import { RefreshTokenModel } from "../models/refreshToken.model";
import { emailService } from "./email.service";
import { emailTemplates } from "../templates/emailTemplates";
import * as tokenUtils from "../utils/token";
import * as pwdUtils from "../utils/password";
import { AppError } from "../utils/appError";
import { HttpCode } from "../constants/httpCodes";
import { IUser } from "../interfaces/user.interface";
import {
  RegisterDTO,
  LoginDTO,
  AuthResponse,
  TokenPayload,
  UpdateProfileDTO,
  ChangePasswordDTO,
  ResetPasswordDTO,
} from "../interfaces/auth.interface";

export class AuthService {
  private userRepo = new UserRepository();

  async register(data: RegisterDTO): Promise<IUser> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw new AppError(HttpCode.CONFLICT, "Email already exists");

    const otp = tokenUtils.generateOTP();
    const passwordHash = await pwdUtils.hashPassword(data.password);

    const user = await this.userRepo.create({
      ...data,
      passwordHash,
      verificationToken: otp,
      verificationTokenExpiry: new Date(Date.now() + 30 * 60 * 1000),
    });

    await emailService.send(
      user.email,
      "Verify Account",
      emailTemplates.verifyEmail(otp),
    );
    return user;
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepo.findByVerificationToken(token);
    if (!user)
      throw new AppError(HttpCode.BAD_REQUEST, "Invalid or expired OTP");

    await this.userRepo.update(user._id.toString(), {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    });
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(data.email);
    if (
      !user ||
      !(await pwdUtils.verifyPassword(user.passwordHash, data.password))
    ) {
      throw new AppError(HttpCode.UNAUTHORIZED, "Invalid credentials");
    }

    if (!user.isVerified)
      throw new AppError(HttpCode.FORBIDDEN, "Please verify your email first");

    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = tokenUtils.generateAccessToken(payload);
    const refreshToken = tokenUtils.generateRefreshToken(payload);

    await RefreshTokenModel.create({
      userId: user._id,
      tokenHash: await tokenUtils.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        profileImage: user.profileImage || undefined,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!token)
      throw new AppError(HttpCode.UNAUTHORIZED, "Refresh token required");
    const decoded = tokenUtils.verifyRefreshToken(token);

    const savedToken = await RefreshTokenModel.findOne({
      userId: decoded.userId,
      revoked: false,
    }).sort({ createdAt: -1 });
    if (
      !savedToken ||
      !(await tokenUtils.verifyHashedToken(token, savedToken.tokenHash))
    ) {
      throw new AppError(HttpCode.UNAUTHORIZED, "Invalid Refresh Token");
    }

    savedToken.revoked = true;
    await savedToken.save();

    const user = await this.userRepo.findById(decoded.userId);
    if (!user) throw new AppError(HttpCode.NOT_FOUND, "User not found");

    const newPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = tokenUtils.generateAccessToken(newPayload);
    const refreshToken = tokenUtils.generateRefreshToken(newPayload);

    await RefreshTokenModel.create({
      userId: user._id,
      tokenHash: await tokenUtils.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { userId, revoked: false },
      { revoked: true },
    );
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString("hex");
    await this.userRepo.update(user._id.toString(), {
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
    });

    await emailService.send(
      user.email,
      "Reset Password",
      emailTemplates.resetPassword(resetToken),
    );
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    const user = await this.userRepo.findByResetToken(data.token);
    if (!user)
      throw new AppError(
        HttpCode.BAD_REQUEST,
        "Invalid or expired reset token",
      );

    const passwordHash = await pwdUtils.hashPassword(data.newPassword);
    await this.userRepo.update(user._id.toString(), {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    await this.logout(user._id.toString());
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError(HttpCode.NOT_FOUND, "User not found");
    return user;
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileDTO,
    file?: Express.Multer.File,
  ): Promise<IUser> {
    const updateData: any = { ...data };
    if (file) {
      updateData.profileImage = `/uploads/profile/${file.filename}`;
    }
    const updatedUser = await this.userRepo.update(userId, updateData);
    if (!updatedUser) throw new AppError(HttpCode.NOT_FOUND, "User not found");
    return updatedUser;
  }

  async changePassword(userId: string, data: ChangePasswordDTO): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (
      !user ||
      !(await pwdUtils.verifyPassword(user.passwordHash, data.currentPassword))
    ) {
      throw new AppError(HttpCode.BAD_REQUEST, "Current password is incorrect");
    }

    const passwordHash = await pwdUtils.hashPassword(data.newPassword);
    await this.userRepo.update(userId, { passwordHash });
    await this.logout(userId);
  }

  async resendOTP(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || user.isVerified)
      throw new AppError(HttpCode.BAD_REQUEST, "Invalid request");

    const otp = tokenUtils.generateOTP();
    await this.userRepo.update(user._id.toString(), {
      verificationToken: otp,
      verificationTokenExpiry: new Date(Date.now() + 30 * 60 * 1000),
    });

    await emailService.send(
      user.email,
      "New OTP Code",
      emailTemplates.verifyEmail(otp),
    );
  }
}
