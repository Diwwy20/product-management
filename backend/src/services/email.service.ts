import nodemailer from "nodemailer";
import { config } from "../config/env";
import { AppError } from "../utils/appError";
import { HttpCode } from "../constants/httpCodes";

class EmailService {
  private transporter = nodemailer.createTransport({
    host: config.SMTP.HOST,
    port: config.SMTP.PORT,
    secure: false,
    auth: {
      user: config.SMTP.USER,
      pass: config.SMTP.PASS,
    },
  });

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Senior Store" <${config.SMTP.USER}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error("Email Send Error:", error);
      throw new AppError(
        HttpCode.INTERNAL_SERVER_ERROR,
        "Failed to send email",
      );
    }
  }
}

export const emailService = new EmailService();
