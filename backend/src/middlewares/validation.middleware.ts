import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { HttpCode } from "../constants/httpCodes";

export const handleValidationErrors = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err: any) => ({
      field: err.path,
      message: err.msg,
    }));
    throw new AppError(
      HttpCode.UNPROCESSABLE_ENTITY,
      JSON.stringify(formattedErrors),
    );
  }
  next();
};

export const authValidator = {
  register: [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 chars"),
    body("firstName").optional().trim().notEmpty(),
    body("phoneNumber")
      .optional()
      .custom((value) => {
        const thaiPhoneRegex = /^0[0-9]{9}$/;
        if (!thaiPhoneRegex.test(value)) {
          throw new Error(
            "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0 เท่านั้น",
          );
        }
        return true;
      }),
  ],
  login: [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  resetPassword: [
    body("token").notEmpty().withMessage("Token is required"),
    body("newPassword").isLength({ min: 8 }),
  ],
  changePassword: [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }),
  ],
  forgotPassword: [body("email").isEmail()],
  verifyEmail: [body("token").notEmpty()],
  resendOTP: [body("email").isEmail()],
};

export const categoryValidator = {
  create: [
    body("nameEn")
      .trim()
      .notEmpty()
      .withMessage("English name is required")
      .isLength({ max: 100 }),
    body("nameTh")
      .trim()
      .notEmpty()
      .withMessage("Thai name is required")
      .isLength({ max: 100 }),
    body("descriptionEn").optional().trim().isLength({ max: 500 }),
    body("descriptionTh").optional().trim().isLength({ max: 500 }),
  ],
  update: [
    body("nameEn").optional().trim().notEmpty(),
    body("nameTh").optional().trim().notEmpty(),
    body("descriptionEn").optional().trim(),
    body("descriptionTh").optional().trim(),
    body("isActive").optional().isBoolean(),
  ],
};

export const productValidator = {
  create: [
    body("nameEn").trim().notEmpty().withMessage("English name is required"),
    body("nameTh").trim().notEmpty().withMessage("Thai name is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a positive integer"),
    body("sku").trim().notEmpty().withMessage("SKU is required"),
    body("categoryId").isMongoId().withMessage("Invalid Category ID format"),
  ],
  update: [
    body("price").optional().isNumeric(),
    body("stock").optional().isInt({ min: 0 }),
    body("categoryId").optional().isMongoId(),
  ],
};
