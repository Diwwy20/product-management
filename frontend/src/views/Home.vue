<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ProductService } from '@/services/product.service';
import { CategoryService } from '@/services/category.service';
import type { IProduct } from '@/interfaces/product.interface';
import type { ICategory } from '@/interfaces/category.interface';
import { getImageUrl } from '@/utils/format';
import { Search, Filter, PackageSearch, Loader2, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-vue-next';
import { DelayDebounce } from '@/constants/constants';

const { t, locale } = useI18n();

const products = ref<IProduct[]>([]);
const categories = ref<ICategory[]>([]);
const loading = ref<boolean>(false);
const searchQuery = ref<string>('');
const selectedCategory = ref<string>('');
const page = ref<number>(1);
const totalPages = ref<number>(1);

const fetchData = async () => {
  loading.value = true;
  try {
    const [prodRes, catRes] = await Promise.all([
      ProductService.getAll({ 
        page: page.value, 
        search: searchQuery.value, 
        categoryId: selectedCategory.value,
        limit: 8,
        isActive: 'true' 
      }),
      CategoryService.getAll({ 
        limit: 100,
      })
    ]);
    
    categories.value = catRes.data.filter(c => c.isActive);
    
    products.value = prodRes.data;
    totalPages.value = prodRes.pagination.totalPages;
  } finally {
    loading.value = false;
  }
};

let debounce: ReturnType<typeof setTimeout>;
watch([searchQuery, selectedCategory], () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    page.value = 1;
    fetchData();
  }, DelayDebounce.DELAY);
});

onMounted(fetchData);

const changePage = (p: number) => {
  page.value = p;
  fetchData();
};
</script>

<template>
  <div class="space-y-8">
    <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="flex items-center gap-4 w-full md:w-auto">
        <div class="relative flex-1 md:w-80">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="t('home.search_placeholder')"
            class="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
          >
        </div>
        
        <div class="relative">
          <Filter class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
          <select 
            v-model="selectedCategory"
            class="pl-12 pr-10 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 appearance-none min-w-[180px]"
          >
            <option value="">{{ t('home.all_categories') }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ locale === 'th' ? cat.nameTh : cat.nameEn }}
            </option>
          </select>
        </div>
      </div>

      <div class="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full">
        {{ t('home.total_items') }}: {{ products.length }}
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-32 text-blue-600">
      <Loader2 class="animate-spin mb-4" :size="64" />
      <span class="font-black uppercase tracking-[0.3em] text-slate-400 text-xs">{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-32 text-slate-300">
      <div class="bg-white p-10 rounded-[3rem] shadow-inner mb-6">
        <PackageSearch :size="100" class="opacity-20" />
      </div>
      <p class="text-xl font-black uppercase tracking-tighter text-slate-400">{{ t('home.no_products') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div 
        v-for="item in products" 
        :key="item.id"
        @click="$router.push(`/products/${item.id}`)"
        class="bg-white rounded-[2.5rem] overflow-hidden border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative"
      >
        <div class="aspect-square bg-slate-50 relative overflow-hidden">
          <img 
            v-if="item.images?.length"
            :src="getImageUrl(item.images[0])"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-slate-200">
            <ShoppingBag :size="64" />
          </div>
          
          <div class="absolute top-6 right-6 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[9px] font-black uppercase text-slate-400 shadow-sm border border-white/20">
            {{ item.sku }}
          </div>
        </div>

        <div class="p-8 space-y-4">
          <div class="space-y-1">
            <p class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
              {{ typeof item.categoryId === 'object' ? (locale === 'th' ? item.categoryId.nameTh : item.categoryId.nameEn) : '' }}
            </p>
            <h3 class="font-black text-slate-800 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors tracking-tight">
              {{ locale === 'th' ? item.nameTh : item.nameEn }}
            </h3>
          </div>

          <div class="flex items-center justify-between pt-2">
            <div class="flex flex-col">
              <span class="text-2xl font-black text-slate-900 tracking-tighter">฿{{ item.price.toLocaleString() }}</span>
            </div>
            
            <div 
              class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm"
              :class="item.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
            >
              {{ item.stock > 0 ? t('home.in_stock') : t('home.out_of_stock') }}
            </div>
          </div>
        </div>

        <div class="absolute inset-0 border-4 border-transparent group-hover:border-blue-500/10 rounded-[2.5rem] pointer-events-none transition-all duration-500"></div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 pt-16">
      <button 
        :disabled="page === 1" 
        @click="changePage(page - 1)"
        class="cursor-pointer p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white disabled:opacity-20 transition-all active:scale-90"
      >
        <ChevronLeft :size="24" />
      </button>
      
      <div class="bg-white px-8 py-4 rounded-2xl border border-slate-100 font-black text-slate-900 shadow-inner tracking-widest">
        {{ page }} <span class="text-slate-300 mx-2">/</span> {{ totalPages }}
      </div>

      <button 
        :disabled="page === totalPages" 
        @click="changePage(page + 1)"
        class="cursor-pointer p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white disabled:opacity-20 transition-all active:scale-90"
      >
        <ChevronRight :size="24" />
      </button>
    </div>
  </div>
</template>