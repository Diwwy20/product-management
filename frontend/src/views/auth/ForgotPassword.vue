<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { AuthService } from '@/services/auth.service';
import { AppPath } from '@/constants/constants';
import { LifeBuoy, Loader2, Mail, ArrowLeft } from 'lucide-vue-next';

const { t } = useI18n();
const toast = useToast();

const email = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  if (!email.value) {
    toast.warning(t('auth.error_fill_form'));
    return;
  }
  
  loading.value = true;
  try {
    await AuthService.forgotPassword({ email: email.value });
    toast.success(t('auth.forgot_sent_success'));
  } catch (err: any) {
    toast.error(t('auth.error_general'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-6">
    <div class="max-w-[420px] w-full space-y-10">
      <div class="text-center space-y-4">
        <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
          <LifeBuoy :size="40" />
        </div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tighter">{{ t('auth.forgot_password_title') }}</h2>
        <p class="text-sm text-slate-400 font-bold px-4">{{ t('auth.forgot_password_desc') }}</p>
      </div>

      <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
        <div class="space-y-6">
          <div class="space-y-2 text-left">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('auth.email') }}</label>
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input v-model="email" type="email" class="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="your@email.com">
            </div>
          </div>

          <button @click="handleSubmit" :disabled="loading" class="cursor-pointer w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-100 transition-all active:scale-95 disabled:opacity-50">
            <span v-if="!loading">{{ t('auth.send_link') }}</span>
            <Loader2 v-else class="animate-spin mx-auto" :size="24" />
          </button>
        </div>
      </div>

      <div class="text-center">
        <router-link :to="AppPath.LOGIN" class="inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-blue-600 transition uppercase tracking-widest">
          <ArrowLeft :size="16" />
          {{ t('auth.back_to_login') }}
        </router-link>
      </div>
    </div>
  </div>
</template>