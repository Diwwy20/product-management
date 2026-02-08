<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import { AppPath, UserRole } from '@/constants/constants';
import { getImageUrl } from '@/utils/format';
import { 
  Home, 
  Package, 
  Tags, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  LogIn
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const menuItems = computed(() => [
  { 
    name: t('menu.home'), 
    path: AppPath.HOME, 
    icon: Home, 
    role: null 
  },
  { 
    name: t('menu.manage_products'), 
    path: '/admin/products', 
    icon: ShieldCheck, 
    role: UserRole.ADMIN 
  },
  { 
    name: t('menu.manage_categories'), 
    path: AppPath.CATEGORIES, 
    icon: Tags, 
    role: UserRole.ADMIN 
  },
]);

const filteredMenu = computed(() => {
  return menuItems.value.filter(item => {
    if (!item.role) return true;
    return authStore.user?.role === item.role;
  });
});

const isActive = (path: string) => route.path === path;

const handleLogout = async () => {
  await authStore.logout();
  router.push(AppPath.LOGIN);
};
</script>

<template>
  <aside class="w-72 bg-slate-900 text-white h-screen sticky top-0 flex flex-col shadow-2xl">
    
    <div class="p-8 flex items-center space-x-4 border-b border-slate-800/50">
      <div class="bg-blue-600 p-2.5 rounded-xl shadow-lg">
        <Package :size="24" />
      </div>
      <span class="text-xl font-black uppercase tracking-tighter italic">Senior Store</span>
    </div>

    <nav class="flex-1 p-6 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
      <router-link 
        v-for="item in filteredMenu" 
        :key="item.path" 
        :to="item.path"
        class="flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group"
        :class="[isActive(item.path) ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white']"
      >
        <component :is="item.icon" :size="20" class="shrink-0 group-hover:scale-110 transition-transform" />
        <span class="ml-3.5 font-bold text-sm tracking-wide">{{ item.name }}</span>
        <ChevronRight v-if="isActive(item.path)" :size="16" class="ml-auto opacity-50" />
      </router-link>
    </nav>

    <div class="p-6 bg-slate-950/50 border-t border-slate-800">
      
      <template v-if="authStore.isLoggedIn">
        <div 
          class="flex items-center space-x-3 mb-6 p-2 rounded-2xl hover:bg-slate-800/50 transition cursor-pointer" 
          @click="$router.push(AppPath.PROFILE)"
        >
          <div class="w-10 h-10 rounded-full bg-blue-500 border-2 border-slate-700 flex items-center justify-center font-black overflow-hidden">
            <img 
              v-if="authStore.user?.profileImage" 
              :src="getImageUrl(authStore.user.profileImage)" 
              class="w-full h-full object-cover"
            >
            <span v-else>{{ authStore.user?.firstName?.charAt(0) }}</span>
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-sm font-black truncate">{{ authStore.user?.firstName }}</p>
            <p class="text-[10px] font-bold text-slate-500 uppercase">{{ authStore.user?.role }}</p>
          </div>
        </div>
        
        <button 
          @click="handleLogout" 
          class="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-red-400 font-bold text-xs border border-red-500/20 hover:bg-red-500/10 transition active:scale-95 cursor-pointer"
        >
          <LogOut :size="16" />
          <span>{{ t('auth.logout') }}</span>
        </button>
      </template>

      <template v-else>
        <router-link 
          :to="AppPath.LOGIN"
          class="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-900/20"
        >
          <LogIn :size="16" />
          <span>{{ t('auth.login') }}</span>
        </router-link>
      </template>

    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>