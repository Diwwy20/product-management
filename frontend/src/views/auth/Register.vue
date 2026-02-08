<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { AuthService } from '@/services/auth.service';
import { AppPath } from '@/constants/constants';
import { UserPlus, Loader2, Mail, Lock } from 'lucide-vue-next';

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const loading = ref(false);
const form = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
});

const handleRegister = async () => {
  loading.value = true;
  try {
    await AuthService.register(form);
    toast.success(t('auth.register_success'));
    router.push({ 
      path: AppPath.VERIFY_OTP, 
      query: { email: form.email } 
    });
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('auth.error_general'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-6 py-12">
    <div class="max-w-[480px] w-full space-y-10">
      <div class="text-center space-y-4">
        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
          <UserPlus :size="32" />
        </div>
        <h2 class="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{{ t('auth.register') }}</h2>
      </div>

      <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('auth.firstName') }}</label>
              <input v-model="form.firstName" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" required>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('auth.lastName') }}</label>
              <input v-model="form.lastName" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" required>
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('auth.email') }}</label>
            <div class="relative">
              <Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input v-model="form.email" type="email" class="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="name@email.com" required>
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('auth.password') }}</label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
              <input v-model="form.password" type="password" class="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" placeholder="At least 8 chars" required minlength="8">
            </div>
          </div>

          <button :disabled="loading" class="cursor-pointer w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 mt-4 shadow-xl shadow-slate-100">
            <span v-if="!loading">{{ t('auth.register') }}</span>
            <Loader2 v-else class="animate-spin mx-auto" :size="24" />
          </button>
        </form>
      </div>

      <div class="text-center">
        <router-link :to="AppPath.LOGIN" class="text-sm font-bold text-slate-400 hover:text-blue-600 transition italic">
          {{ t('auth.back_to_login') }}
        </router-link>
      </div>
    </div>
  </div>
</template>