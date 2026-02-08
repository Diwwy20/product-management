<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { AuthService } from '@/services/auth.service';
import { 
  User, Lock, Camera, Save, 
  Loader2, Mail, ShieldCheck, Phone
} from 'lucide-vue-next';
import { getImageUrl } from '@/utils/format';

const { t } = useI18n();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const activeTab = ref<'info' | 'password'>('info');

const profileForm = reactive({
  firstName: authStore.user?.firstName || '',
  lastName: authStore.user?.lastName || '',
  nickName: authStore.user?.nickName || '', 
  phoneNumber: authStore.user?.phoneNumber ||'',
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: ''
});

const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string>(authStore.user?.profileImage || '');

const onAvatarChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) {
    avatarFile.value = target.files[0];
    avatarPreview.value = URL.createObjectURL(target.files[0]);
  }
};

const handlePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  let value = target.value.replace(/\D/g, '');
  
  if (value.length > 10) {
    value = value.slice(0, 10);
  }
  
  profileForm.phoneNumber = value;
};

const handleUpdateProfile = async () => {
  loading.value = true;
  try {
    const updatedUser = await AuthService.updateProfile(profileForm, avatarFile.value || undefined);
    authStore.user = updatedUser; 
    toast.success(t('profile.update_success'));
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('common.error'));
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = async () => {
  if (passwordForm.newPassword.length < 8) {
    toast.warning(t('auth.password_min'));
    return;
  }
  loading.value = true;
  try {
    await AuthService.changePassword(passwordForm);
    toast.success(t('profile.password_success'));
    authStore.logout();
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('common.error'));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto py-10 px-4">
    <div class="bg-white rounded-[3rem] shadow-xl border border-slate-50 overflow-hidden mb-8">
      <div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      <div class="px-10 pb-10 -mt-16 flex flex-col md:flex-row items-end gap-6">
        <div class="relative group">
          <div class="w-32 h-32 rounded-[2.5rem] border-4 border-white bg-slate-100 overflow-hidden shadow-2xl">
            <img 
              v-if="avatarPreview" 
              :src="avatarPreview.startsWith('blob') ? avatarPreview : getImageUrl(avatarPreview)" 
              class="w-full h-full object-cover"
            >
            <User v-else :size="48" class="text-slate-300 m-auto mt-8" />
          </div>
          <label class="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition active:scale-90">
            <Camera :size="18" />
            <input type="file" class="hidden" accept="image/*" @change="onAvatarChange">
          </label>
        </div>
        <div class="flex-1 space-y-1">
          <h1 class="text-3xl font-black text-slate-900 tracking-tighter">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</h1>
          <p class="text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
            <ShieldCheck :size="14" class="text-blue-500" /> {{ authStore.user?.role }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex gap-4 mb-8">
      <button 
        @click="activeTab = 'info'"
        class="cursor-pointer px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
        :class="activeTab === 'info' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'"
      >
        {{ t('profile.personal_info') }}
      </button>
      <button 
        @click="activeTab = 'password'"
        class="cursor-pointer px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
        :class="activeTab === 'password' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'"
      >
        {{ t('profile.security') }}
      </button>
    </div>

    <div class="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50">
      
      <form v-if="activeTab === 'info'" @submit.prevent="handleUpdateProfile" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('auth.firstName') }}</label>
            <input v-model="profileForm.firstName" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold">
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('auth.lastName') }}</label>
            <input v-model="profileForm.lastName" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold">
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('auth.email') }}</label>
          <div class="relative">
            <Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="18" />
            <input :value="authStore.user?.email" disabled type="email" class="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl text-slate-400 font-bold italic">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('profile.nickname') }}</label>
            <input v-model="profileForm.nickName" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold">
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('profile.phone') }}</label>
            <div class="relative">
              <Phone class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="18" />
              <input 
                :value="profileForm.phoneNumber" 
                @input="handlePhoneInput"
                type="text" 
                maxlength="10"
                placeholder="08XXXXXXXX"
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
              >
            </div>
          </div>
        </div>

        <button :disabled="loading" type="submit" class="cursor-pointer w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 mt-6">
          <Loader2 v-if="loading" class="animate-spin" :size="20" />
          <Save v-else :size="20" />
          {{ t('common.save') }}
        </button>
      </form>

      <form v-else @submit.prevent="handleChangePassword" class="space-y-6">
        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('profile.current_password') }}</label>
          <div class="relative">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="18" />
            <input v-model="passwordForm.currentPassword" type="password" class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold">
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('profile.new_password') }}</label>
          <div class="relative">
            <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="18" />
            <input v-model="passwordForm.newPassword" type="password" class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold">
          </div>
        </div>

        <button :disabled="loading" type="submit" class="cursor-pointer w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 mt-6">
          <Loader2 v-if="loading" class="animate-spin" :size="20" />
          <Lock v-else :size="20" />
          {{ t('profile.change_password') }}
        </button>
      </form>

    </div>
  </div>
</template>