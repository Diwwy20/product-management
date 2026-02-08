import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { AppError } from "../utils/appError";
import { HttpCode } from "../constants/httpCodes";
import { UserRole } from "../constants/roles";

declare global {
  namespace Express {
    interface Request {
      user?: import("../interfaces/auth.interface").TokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(
        HttpCode.UNAUTHORIZED,
        "Unauthorized: No token provided",
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError(HttpCode.UNAUTHORIZED, "Invalid or expired token"));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(HttpCode.UNAUTHORIZED, "Not authenticated"));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(
        new AppError(
          HttpCode.FORBIDDEN,
          "Forbidden: You do not have permission",
        ),
      );
    }

    next();
  };
};
