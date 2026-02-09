import api from "@/api/axios";
import type {
  IAuthResponse,
  ILoginDTO,
  IRegisterDTO,
  IVerifyEmailDTO,
  IForgotPasswordDTO,
  IUpdateProfileDTO,
  IChangePasswordDTO,
  IUser,
} from "@/interfaces/auth.interface";

export const AuthService = {
  async login(payload: ILoginDTO): Promise<IAuthResponse> {
    const { data } = await api.post<IAuthResponse>("/auth/login", payload);
    return data;
  },

  async register(payload: IRegisterDTO): Promise<any> {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  async verifyEmail(payload: IVerifyEmailDTO): Promise<any> {
    const { data } = await api.post("/auth/verify-email", payload);
    return data;
  },

  async resendOTP(email: string): Promise<any> {
    const { data } = await api.post("/auth/resend-otp", { email });
    return data;
  },

  async forgotPassword(payload: IForgotPasswordDTO): Promise<any> {
    const { data } = await api.post("/auth/forgot-password", payload);
    return data;
  },

  async refreshToken(): Promise<IAuthResponse> {
    const { data } = await api.post<IAuthResponse>("/auth/refresh-token");
    return data;
  },

  async getProfile(): Promise<any> {
    const { data } = await api.get("/auth/me");
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async updateProfile(payload: IUpdateProfileDTO, file?: File): Promise<IUser> {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (file) formData.append("avatar", file);

    const { data } = await api.put<{ success: boolean; data: IUser }>(
      "/auth/me",
      formData,
    );
    return data.data;
  },

  async changePassword(payload: IChangePasswordDTO): Promise<void> {
    await api.put("/auth/me/change-password", payload);
  },

  async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<any> {
    const { data } = await api.post("/auth/reset-password", payload);
    return data;
  },
};
