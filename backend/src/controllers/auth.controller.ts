import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { HttpCode } from "../constants/httpCodes";

const authService = new AuthService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.register(req.body);
    res.status(HttpCode.CREATED).json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authService.verifyEmail(req.body.token);
    res.status(HttpCode.OK).json({ success: true, message: "Email verified" });
  } catch (e) {
    next(e);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(HttpCode.OK).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const result = await authService.refreshToken(token);
    res.cookie("refreshToken", result.refreshToken, { httpOnly: true });
    res.status(HttpCode.OK).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authService.logout(req.user!.userId);
    res.clearCookie("refreshToken");
    res.status(HttpCode.OK).json({ success: true, message: "Logged out" });
  } catch (e) {
    next(e);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authService.forgotPassword(req.body.email);
    res
      .status(HttpCode.ACCEPTED)
      .json({ success: true, message: "Reset link sent if email exists" });
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authService.resetPassword(req.body);
    res
      .status(HttpCode.OK)
      .json({ success: true, message: "Password reset successful" });
  } catch (e) {
    next(e);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.status(HttpCode.OK).json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await authService.updateProfile(
      req.user!.userId,
      req.body,
      req.file,
    );
    res.status(HttpCode.OK).json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authService.changePassword(req.user!.userId, req.body);
    res
      .status(HttpCode.OK)
      .json({ success: true, message: "Password changed successfully" });
  } catch (e) {
    next(e);
  }
};

export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authService.resendOTP(req.body.email);
    res.status(HttpCode.OK).json({ success: true, message: "OTP resent" });
  } catch (e) {
    next(e);
  }
};
