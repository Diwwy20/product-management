import { HttpCode } from "../constants/httpCodes";

export class AppError extends Error {
  public readonly statusCode: HttpCode;
  public readonly isOperational: boolean;

  constructor(statusCode: HttpCode, message: string, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
