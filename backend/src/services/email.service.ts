import * as brevo from "@getbrevo/brevo";
import { config } from "../config/env";
import { AppError } from "../utils/appError";
import { HttpCode } from "../constants/httpCodes";

class EmailService {
  private apiInstance = new brevo.TransactionalEmailsApi();

  constructor() {
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      config.BREVO.API_KEY,
    );
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = {
      name: config.BREVO.SENDER_NAME,
      email: config.BREVO.SENDER_EMAIL,
    };
    sendSmtpEmail.to = [{ email: to }];

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ Email sent via Brevo to ${to}`);
    } catch (error) {
      console.error("Brevo API Error:", error);
      throw new AppError(
        HttpCode.INTERNAL_SERVER_ERROR,
        "Failed to send email via Brevo Service",
      );
    }
  }
}

export const emailService = new EmailService();
