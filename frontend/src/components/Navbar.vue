<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const router = useRouter();
const { locale } = useI18n();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

const toggleLanguage = () => {
  locale.value === 'en' ? 'th' : 'en'
};
</script>

<template>
  <nav class="bg-white shadow px-6 py-4 flex justify-between items-center">
    <router-link to="/" class="text-xl font-bold text-blue-600">SENIOR STORE</router-link>
    
    <div class="flex items-center space-x-4">
      <button @click="toggleLanguage" class="text-sm font-medium border px-2 py-1 rounded cursor-pointer">
        {{ locale.toUpperCase() }}
      </button>

      <template v-if="authStore.isLoggedIn">
        <span class="text-gray-700">สวัสดี, {{ authStore.user?.firstName }}</span>
        <button @click="handleLogout" class="text-red-500 text-sm font-bold cursor-pointer">LOGOUT</button>
      </template>

      <template v-else>
        <router-link to="/login" class="text-blue-600">Login</router-link>
        <router-link to="/register" class="bg-blue-600 text-white px-4 py-2 rounded">Register</router-link>
      </template>
    </div>
  </nav>
</template>