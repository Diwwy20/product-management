<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import { useI18n } from 'vue-i18n';
import { 
  Languages, 
  ChevronDown, 
  Check 
} from 'lucide-vue-next';

const { locale } = useI18n();

const isLangOpen = ref(false);
const langMenuRef = ref<HTMLElement | null>(null);

const toggleLangMenu = () => {
  isLangOpen.value = !isLangOpen.value;
};

const setLanguage = (lang: 'th' | 'en') => {
  locale.value = lang;
  isLangOpen.value = false;
  localStorage.setItem('user-locale', lang);
};

const handleClickOutside = (event: MouseEvent) => {
  if (langMenuRef.value && !langMenuRef.value.contains(event.target as Node)) {
    isLangOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  const savedLocale = localStorage.getItem('user-locale');
  if (savedLocale === 'th' || savedLocale === 'en') {
    locale.value = savedLocale;
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 font-sans">
    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0">
      
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40 shadow-sm">
        
        <div class="flex flex-col">
          <p class="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">Senior Store</p>
          <h2 class="text-sm font-black text-slate-800 uppercase tracking-widest">
            {{ $route.name }}
          </h2>
        </div>
        
        
        <div class="relative" ref="langMenuRef">
          <button 
            @click="toggleLangMenu"
            class="cursor-pointer flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-2 border-transparent hover:border-slate-200 rounded-2xl transition-all active:scale-95 group"
            :class="{ 'border-blue-500 bg-white shadow-lg shadow-blue-50': isLangOpen }"
          >
            <div class="bg-white p-1.5 rounded-lg shadow-sm group-hover:text-blue-600 transition-colors">
              <Languages :size="16" />
            </div>
            <span class="text-xs font-black uppercase text-slate-700 tracking-widest">
              {{ locale === 'th' ? 'ภาษาไทย (TH)' : 'English (EN)' }}
            </span>
            <ChevronDown 
              :size="14" 
              class="text-slate-400 transition-transform duration-300"
              :class="{ 'rotate-180 text-blue-500': isLangOpen }"
            />
          </button>

          <transition 
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0 -translate-y-2"
            enter-to-class="transform scale-100 opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100 translate-y-0"
            leave-to-class="transform scale-95 opacity-0 -translate-y-2"
          >
            <div 
              v-if="isLangOpen" 
              class="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-3 overflow-hidden"
            >
              <div class="space-y-1">
                <button 
                  @click="setLanguage('th')"
                  class="cursor-pointer w-full flex items-center justify-between px-5 py-4 rounded-[1.5rem] transition-all group"
                  :class="locale === 'th' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-500'"
                >
                  <span class="text-xs font-black uppercase tracking-widest">ภาษาไทย (TH)</span>
                  <Check v-if="locale === 'th'" :size="16" />
                </button>

                <button 
                  @click="setLanguage('en')"
                  class="cursor-pointer w-full flex items-center justify-between px-5 py-4 rounded-[1.5rem] transition-all group"
                  :class="locale === 'en' ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-500'"
                >
                  <span class="text-xs font-black uppercase tracking-widest">English (EN)</span>
                  <Check v-if="locale === 'en'" :size="16" />
                </button>
              </div>
            </div>
          </transition>
        </div>
      </header>

      <main class="flex-1 p-10 overflow-y-auto overflow-x-hidden scroll-smooth">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-track {
  background: transparent;
}
main::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
main::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}
</style>