<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { AuthService } from '@/services/auth.service';
import { AppPath } from '@/constants/constants';
import { KeyRound, Loader2, Lock, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-vue-next';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(false);
const token = ref((route.query.token as string) || '');

const form = reactive({
  newPassword: '',
  confirmPassword: ''
});

onMounted(() => {
  if (!token.value) {
    toast.error(t('auth.error_general'));
    router.push(AppPath.LOGIN);
  }
});

const handleReset = async () => {
  // 1. ตรวจสอบความยาวรหัสผ่าน
  if (form.newPassword.length < 8) {
    toast.warning(t('auth.password_min'));
    return;
  }
  
  // 2. ตรวจสอบรหัสผ่านให้ตรงกัน
  if (form.newPassword !== form.confirmPassword) {
    toast.warning(t('common.password_match_error'));
    return;
  }

  loading.value = true;
  try {
    await AuthService.resetPassword({ 
      token: token.value, 
      newPassword: form.newPassword 
    });
    
    toast.success(t('auth.reset_success')); 
    router.push(AppPath.LOGIN);
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('auth.error_general'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-6 relative overflow-hidden">
    <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>

    <div class="max-w-[420px] w-full space-y-10 z-10">
      <div class="text-center space-y-4">
        <div class="w-20 h-20 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 rotate-6">
          <KeyRound :size="40" />
        </div>
        <div class="space-y-1">
          <h2 class="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            {{ t('auth.reset_password_title') }}
          </h2>
          <p class="text-sm text-slate-400 font-bold px-4">
            {{ t('auth.reset_password_desc') }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
        <form @submit.prevent="handleReset" class="space-y-6">
          <div class="space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              {{ t('profile.new_password') }}
            </label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input 
                v-model="form.newPassword" 
                type="password" 
                class="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" 
                placeholder="••••••••" 
                required
              >
            </div>
          </div>

          <div class="space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              {{ t('auth.confirm') }} {{ t('auth.password') }}
            </label>
            <div class="relative">
              <CheckCircle2 class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input 
                v-model="form.confirmPassword" 
                type="password" 
                class="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" 
                placeholder="••••••••" 
                required
              >
            </div>
          </div>

          <button 
            :disabled="loading" 
            type="submit" 
            class="cursor-pointer w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            <span v-if="!loading" class="flex items-center justify-center gap-2">
              {{ t('common.save') }}
            </span>
            <Loader2 v-else class="animate-spin mx-auto" :size="24" />
          </button>
        </form>
      </div>

      <div class="text-center">
        <router-link :to="AppPath.LOGIN" class="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 transition uppercase tracking-widest italic">
          <ArrowLeft :size="14" />
          {{ t('auth.back_to_login') }}
        </router-link>
      </div>
    </div>
  </div>
</template>