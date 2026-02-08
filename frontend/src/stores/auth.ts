import { defineStore } from "pinia";
import { AuthService } from "@/services/auth.service";
import type { IUser, ILoginDTO } from "@/interfaces/auth.interface";
import { UserRole } from "@/constants/constants";
import { useToast } from "vue-toastification";
import i18n from "@/locales/i18n";

const toast = useToast();

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as IUser | null,
    accessToken: "" as string,
    isInitialized: false,
    loading: false,
  }),

  getters: {
    isLoggedIn: (state): boolean => !!state.accessToken,
    isAdmin: (state): boolean => state.user?.role === UserRole.ADMIN,
  },

  actions: {
    async login(credentials: ILoginDTO) {
      this.loading = true;
      try {
        const data = await AuthService.login(credentials);
        this.accessToken = data.data.accessToken;
        this.user = data.data.user;
        this.isInitialized = true;
      } finally {
        this.loading = false;
      }
    },

    async refresh() {
      try {
        const data = await AuthService.refreshToken();
        this.accessToken = data.data.accessToken;

        const profile = await AuthService.getProfile();
        this.user = profile.data;
      } catch (error) {
        this.clearAuth();
        throw error;
      } finally {
        this.isInitialized = true;
      }
    },

    clearAuth() {
      this.user = null;
      this.accessToken = "";
      this.isInitialized = true;
    },

    async logout() {
      try {
        await AuthService.logout();
      } catch (error) {
        console.warn("Logout API failed, cleaning up locally...");
      } finally {
        this.clearAuth();

        toast.info(i18n.global.t("auth.logout_success_msg"));
      }
    },
  },
});
