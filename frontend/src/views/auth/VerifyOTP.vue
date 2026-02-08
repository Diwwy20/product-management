<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { AuthService } from '@/services/auth.service';
import { AppPath } from '@/constants/constants';
import { ShieldCheck, Loader2 } from 'lucide-vue-next';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const otp = ref('');
const email = (route.query.email as string) || '';
const loading = ref(false);

const handleVerify = async () => {
  if (otp.value.length < 6) return;
  loading.value = true;
  try {
    await AuthService.verifyEmail({ token: otp.value });
    toast.success(t('auth.otp_verified'));
    router.push(AppPath.LOGIN);
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('auth.error_general'));
  } finally {
    loading.value = false;
  }
};

const resendOTP = async () => {
  try {
    await AuthService.resendOTP(email);
    toast.info(t('auth.otp_resent'));
  } catch (err: any) {
    toast.error(t('auth.error_general'));
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-6">
    <div class="max-w-[440px] w-full space-y-8 text-center">
      <div class="inline-flex p-5 rounded-[2.5rem] bg-white shadow-sm border border-slate-100 mb-2">
        <ShieldCheck class="text-blue-600" :size="40" />
      </div>
      
      <div class="space-y-2">
        <h2 class="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{{ t('auth.otp_title') }}</h2>
        <p class="text-sm text-slate-400 font-bold leading-relaxed">
          {{ t('auth.otp_description') }} <br>
          <span class="text-blue-600 underline decoration-blue-100 underline-offset-4">{{ email }}</span>
        </p>
      </div>
      
      <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
        <input 
          v-model="otp" 
          type="text" 
          maxlength="6" 
          class="w-full text-center text-6xl tracking-[1rem] border-b-4 border-slate-100 py-6 focus:border-blue-500 outline-none mb-10 font-black transition-all placeholder:text-slate-50"
          placeholder="000000"
        >

        <button @click="handleVerify" :disabled="loading || otp.length < 6" class="cursor-pointer w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-20 mb-8">
          <span v-if="!loading">{{ t('auth.confirm') }}</span>
          <Loader2 v-else class="animate-spin mx-auto" :size="24" />
        </button>

        <button @click="resendOTP" class="cursor-pointer text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition">
          {{ t('auth.resend_otp') }}
        </button>
      </div>
    </div>
  </div>
</template>