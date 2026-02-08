<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(async () => {
  if (!authStore.isInitialized) {
    try {
      await authStore.refresh();
    } catch (err) {
      console.log("No active session.");
    }
  }
});
</script>

<template>
  <div v-if="!authStore.isInitialized" class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
  
  <router-view v-else />
</template>

<style>

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>