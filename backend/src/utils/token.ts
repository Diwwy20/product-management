import jwt from "jsonwebtoken";
import argon2 from "argon2";
import crypto from "crypto";
import { TokenPayload } from "../interfaces/auth.interface";
import { config } from "../config/env";

const ACCESS_SECRET = config.JWT.ACCESS_SECRET;
const REFRESH_SECRET = config.JWT.REFRESH_SECRET;

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: config.JWT.ACCESS_EXPIRES,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: config.JWT.REFRESH_EXPIRES,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};

export const hashToken = async (token: string): Promise<string> => {
  return await argon2.hash(token, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
};

export const verifyHashedToken = async (
  token: string,
  hashedToken: string,
): Promise<boolean> => {
  return await argon2.verify(hashedToken, token);
};

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};
