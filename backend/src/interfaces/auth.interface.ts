import { UserRole } from "../constants/roles";

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    profileImage?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  nickName?: string;
  phoneNumber?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  nickName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ResendOTPDTO {
  email: string;
}
