import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { HttpCode } from "../constants/httpCodes";
import { config } from "../config/env";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: config.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(HttpCode.BAD_REQUEST).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong on our end",
    stack: config.NODE_ENV === "development" ? err.stack : undefined,
  });
};
