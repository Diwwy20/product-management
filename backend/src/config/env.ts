import dotenv from "dotenv";

dotenv.config();

export type ExpiresInString = `${number}${"d" | "h" | "m" | "s"}`;

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  API_PREFIX: string;

  JWT: {
    ACCESS_SECRET: string;
    REFRESH_SECRET: string;
    ACCESS_EXPIRES: ExpiresInString | number;
    REFRESH_EXPIRES: ExpiresInString | number;
  };

  BREVO: {
    API_KEY: string;
    SENDER_EMAIL: string;
    SENDER_NAME: string;
  };

  FRONTEND_URL: string;
  COOKIE_SECURE: boolean;
  COOKIE_SAME_SITE: "strict" | "lax" | "none";
}

export const config: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGO_URI:
    process.env.MONGO_URI || "mongodb://localhost:27017/product-management",
  API_PREFIX: process.env.API_PREFIX || "/api",

  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "access_secret_key_senior",
    REFRESH_SECRET:
      process.env.JWT_REFRESH_SECRET || "refresh_secret_key_senior",
    ACCESS_EXPIRES:
      (process.env.JWT_ACCESS_EXPIRES_IN as ExpiresInString) || "15m",
    REFRESH_EXPIRES:
      (process.env.JWT_REFRESH_EXPIRES_IN as ExpiresInString) || "7d",
  },

  BREVO: {
    API_KEY: process.env.BREVO_API_KEY || "",
    SENDER_EMAIL:
      process.env.BREVO_SENDER_EMAIL || "sirawit.phaimuang@gmail.com",
    SENDER_NAME: process.env.BREVO_SENDER_NAME || "Senior Store",
  },

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
  COOKIE_SAME_SITE:
    (process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none") || "lax",
};
