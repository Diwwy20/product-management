<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger'
});

defineEmits(['confirm', 'cancel']);
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('cancel')"></div>

      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8 text-center">
          <button @click="$emit('cancel')" class="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition text-slate-400 cursor-pointer">
            <X :size="20" />
          </button>

          <div 
            class="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner"
            :class="variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'"
          >
            <AlertTriangle :size="40" />
          </div>

          <h3 class="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">{{ title }}</h3>
          <p class="text-slate-400 font-bold text-sm mb-10 leading-relaxed px-4">{{ message }}</p>

          <div class="flex gap-4">
            <button 
              @click="$emit('cancel')" 
              class="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400 border-2 border-slate-100 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="$emit('confirm')" 
              class="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-lg transition active:scale-95 cursor-pointer"
              :class="variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-100' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100'"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>