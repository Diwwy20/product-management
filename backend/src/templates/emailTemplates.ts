import { config } from "../config/env";

export const emailTemplates = {
  verifyEmail: (otp: string): string => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #372117; text-align: center;">Verification Code</h2>
      <p style="text-align: center;">Please use the following code to verify your account:</p>
      <div style="background-color: #f4bc58; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #372117;">${otp}</span>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center;">This code will expire in 30 minutes.</p>
    </div>
  `,

  resetPassword: (token: string): string => {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
    return `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #f4bc58; color: #372117; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold;">Reset Password</a>
        <p style="color: #999; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;
  },
};
