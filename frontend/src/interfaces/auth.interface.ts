import { UserRole } from "@/constants/constants";

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  nickName?: string;
  phoneNumber?: string;
}

export interface IAuthResponse {
  success: boolean;
  data: {
    user: IUser;
    accessToken: string;
    refreshToken: string;
  };
}

export interface IRegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IVerifyEmailDTO {
  token: string;
}

export interface IForgotPasswordDTO {
  email: string;
}

export interface IUpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  nickName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface IChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
