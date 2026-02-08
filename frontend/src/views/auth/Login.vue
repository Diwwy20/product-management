<script setup lang="ts">
import { reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { AppPath } from '@/constants/constants';
import { LayoutGrid, Loader2, Mail, Lock } from 'lucide-vue-next';

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const form = reactive({ email: '', password: '' });

const handleLogin = async (): Promise<void> => {
  if (!form.email || !form.password) {
    toast.warning(t('auth.error_fill_form'));
    return;
  }

  try {
    await authStore.login(form);
    toast.success(t('auth.login_success_msg'));
    router.push(AppPath.HOME);
  } catch (err: any) {
    const msg = err.response?.data?.message || t('auth.error_login');
    toast.error(msg);
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-6">
    <div class="max-w-[420px] w-full space-y-10">
      <div class="flex flex-col items-center space-y-4">
        <div class="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200 rotate-12 transition-transform hover:rotate-0 duration-500">
          <LayoutGrid class="text-white" :size="32" />
        </div>
        <div class="text-center">
          <h2 class="text-4xl font-black text-slate-900 tracking-tighter">{{ t('auth.login') }}</h2>
          <p class="text-slate-400 font-medium text-sm mt-1">Management System v1.0</p>
        </div>
      </div>

      <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{{ t('auth.email') }}</label>
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input v-model="form.email" type="email" class="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="your@email.com" required>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex justify-between items-center px-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ t('auth.password') }}</label>
              <router-link :to="AppPath.FORGOT_PASSWORD" class="text-[10px] font-black text-blue-500 hover:text-blue-600 underline underline-offset-4">{{ t('auth.forgot_password_title') }}</router-link>
            </div>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input v-model="form.password" type="password" class="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="••••••••" required>
            </div>
          </div>

          <button :disabled="authStore.loading" type="submit" class="cursor-pointer w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 mt-4">
            <span v-if="!authStore.loading" class="flex items-center justify-center gap-2">
              {{ t('auth.login') }}
            </span>
            <Loader2 v-else class="animate-spin mx-auto" :size="24" />
          </button>
        </form>
      </div>

      <div class="text-center">
        <p class="text-sm text-slate-400 font-bold">
          {{ t('auth.no_account') }}
          <router-link :to="AppPath.REGISTER" class="text-blue-600 hover:underline italic ml-1">{{ t('auth.register') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>