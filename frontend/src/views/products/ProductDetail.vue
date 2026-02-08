<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ProductService } from '@/services/product.service';
import type { IProduct } from '@/interfaces/product.interface';
import { getImageUrl } from '@/utils/format';
import { 
  ArrowLeft, Tag, 
  Package, Clock, CheckCircle, 
  XCircle, Loader2, ChevronRight 
} from 'lucide-vue-next';
import { AppPath } from '@/constants/constants';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const product = ref<IProduct | null>(null);
const loading = ref<boolean>(true);
const activeImage = ref<string>('');

const fetchProductDetail = async () => {
  loading.value = true;
  try {
    const data = await ProductService.getById(route.params.id as string);
    product.value = data;

    if (data.images && data.images.length > 0) {
      const firstImage = data.images[0];
      if (firstImage) {
        activeImage.value = firstImage;
      }
    }
  } catch (err) {
    router.push(AppPath.HOME);
  } finally {
    loading.value = false;
  }
};

const currentDescription = computed(() => {
  if (!product.value) return '';
  return locale.value === 'th' 
    ? product.value.descriptionTh 
    : product.value.descriptionEn;
});

const currentName = computed(() => {
  if (!product.value) return '';
  return locale.value === 'th' ? product.value.nameTh : product.value.nameEn;
});

const currentCategoryName = computed(() => {
  if (!product.value || typeof product.value.categoryId !== 'object') return '';
  return locale.value === 'th' ? product.value.categoryId.nameTh : product.value.categoryId.nameEn;
});

onMounted(fetchProductDetail);
</script>

<template>
  <div class="max-w-7xl mx-auto py-10 px-4 md:px-10">
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 class="animate-spin text-blue-600 mb-4" :size="48" />
      <p class="font-black uppercase tracking-widest text-slate-400">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="product" class="space-y-10">
      <div class="flex items-center justify-between">
        <button 
          @click="router.back()" 
          class="cursor-pointer flex items-center gap-2 text-sm font-black text-slate-400 hover:text-blue-600 transition uppercase tracking-widest"
        >
          <ArrowLeft :size="18" /> {{ t('product.back_to_shop') }}
        </button>
        
        <div class="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          <span>{{ t('menu.home') }}</span>
          <ChevronRight :size="12" />
          <span class="text-blue-500">{{ currentName }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        <div class="space-y-6">
          <div class="aspect-square rounded-[3rem] bg-white border border-slate-100 shadow-2xl overflow-hidden group">
            <img 
              v-if="activeImage" 
              :src="getImageUrl(activeImage)" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            >
            <div v-else class="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
              <Package :size="100" />
            </div>
          </div>

          <div v-if="product.images && product.images.length > 1" class="flex gap-4 overflow-x-auto pb-4">
            <button 
              v-for="(img, idx) in product.images" 
              :key="idx"
              @click="activeImage = img"
              class="cursor-pointer w-24 h-24 rounded-2xl border-2 transition-all overflow-hidden shrink-0 shadow-sm"
              :class="activeImage === img ? 'border-blue-600 scale-105' : 'border-transparent hover:border-slate-200'"
            >
              <img :src="getImageUrl(img)" class="w-full h-full object-cover">
            </button>
          </div>
        </div>

        <div class="space-y-8">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <span class="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {{ currentCategoryName }}
              </span>
              <span class="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                SKU: {{ product.sku }}
              </span>
            </div>
            
            <h1 class="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
              {{ currentName }}
            </h1>
          </div>

          <div class="flex items-end gap-4">
            <span class="text-5xl font-black text-blue-600">฿{{ product.price.toLocaleString() }}</span>
            <span class="text-slate-300 font-bold mb-2">/ {{ t('home.total_items') }}</span>
          </div>

          <hr class="border-slate-100">

          <div class="space-y-3">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Tag :size="14" /> {{ t('product.description') }}
            </h3>
            <p class="text-slate-600 leading-relaxed font-medium">
              {{ currentDescription || 'ไม่มีรายละเอียดสินค้า' }}
            </p>
          </div>

          <div class="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div 
                class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                :class="product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
              >
                <CheckCircle v-if="product.stock > 0" :size="24" />
                <XCircle v-else :size="24" />
              </div>
              <div>
                <p class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ t('product.col_stock') }}</p>
                <p class="text-xl font-black text-slate-800">{{ product.stock }} {{ t('home.total_items') }}</p>
              </div>
            </div>
            
            <span 
              class="font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-full"
              :class="product.stock > 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ product.stock > 0 ? t('home.in_stock') : t('home.out_of_stock') }}
            </span>
          </div>

         

          <div class="pt-6 flex items-center gap-6 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
             <div class="flex items-center gap-2">
               <Clock :size="14" /> {{ t('product.last_updated') }}: {{ new Date(product.updatedAt).toLocaleDateString() }}
             </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
</style>