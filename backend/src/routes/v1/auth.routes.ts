import { Router } from "express";
import * as authController from "../../controllers/auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { uploadProfile } from "../../middlewares/upload.middleware";
import {
  authValidator,
  handleValidationErrors,
} from "../../middlewares/validation.middleware";

const router = Router();

router.post(
  "/register",
  authValidator.register,
  handleValidationErrors,
  authController.register,
);
router.post(
  "/login",
  authValidator.login,
  handleValidationErrors,
  authController.login,
);
router.post(
  "/verify-email",
  authValidator.verifyEmail,
  handleValidationErrors,
  authController.verifyEmail,
);
router.post(
  "/resend-otp",
  authValidator.resendOTP,
  handleValidationErrors,
  authController.resendOTP,
);
router.post(
  "/forgot-password",
  authValidator.forgotPassword,
  handleValidationErrors,
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  authValidator.resetPassword,
  handleValidationErrors,
  authController.resetPassword,
);
router.post("/refresh-token", authController.refreshToken);

router.use(authenticate);

router.get("/me", authController.getProfile);
router.put("/me", uploadProfile.single("avatar"), authController.updateProfile);
router.put(
  "/me/change-password",
  authValidator.changePassword,
  handleValidationErrors,
  authController.changePassword,
);
router.post("/logout", authController.logout);

export default router;
