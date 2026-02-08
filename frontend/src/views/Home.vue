<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ProductService } from '@/services/product.service';
import { CategoryService } from '@/services/category.service';
import type { IProduct } from '@/interfaces/product.interface';
import type { ICategory } from '@/interfaces/category.interface';
import { getImageUrl } from '@/utils/format';
import { Search, Filter, PackageSearch, Loader2, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-vue-next';

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
        limit: 8 
      }),
      CategoryService.getAll({ limit: 100 })
    ]);
    products.value = prodRes.data;
    totalPages.value = prodRes.pagination.totalPages;
    categories.value = catRes.data;
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
  }, 500);
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
            class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
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

      <div class="text-slate-400 text-sm font-bold uppercase tracking-widest">
        {{ t('home.total_items') }}: {{ products.length }}
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-blue-600">
      <Loader2 class="animate-spin mb-4" :size="48" />
      <span class="font-black uppercase tracking-widest">{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-300">
      <PackageSearch :size="80" class="mb-4 opacity-20" />
      <p class="text-xl font-bold">{{ t('home.no_products') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="item in products" 
        :key="item.id"
        @click="$router.push(`/products/${item.id}`)"
        class="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
      >
        <div class="aspect-square bg-slate-100 relative overflow-hidden">
          <img 
            v-if="item.images?.length"
            :src="getImageUrl(item.images[0])"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingBag :size="48" />
          </div>
          <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-blue-600 shadow-sm">
            {{ item.sku }}
          </div>
        </div>

        <div class="p-6 space-y-3">
          <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest">
            {{ typeof item.categoryId === 'object' ? (locale === 'th' ? item.categoryId.nameTh : item.categoryId.nameEn) : '' }}
          </p>
          <h3 class="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {{ locale === 'th' ? item.nameTh : item.nameEn }}
          </h3>
          <div class="flex items-center justify-between pt-2">
            <span class="text-xl font-black text-slate-900">฿{{ item.price.toLocaleString() }}</span>
            <span 
              class="text-[10px] font-bold px-2 py-1 rounded-lg"
              :class="item.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
            >
              {{ item.stock > 0 ? t('home.in_stock') : t('home.out_of_stock') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 pt-10">
      <button 
        :disabled="page === 1" 
        @click="changePage(page - 1)"
        class="cursor-pointer p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 disabled:opacity-20 transition"
      >
        <ChevronLeft :size="20" />
      </button>
      <span class="font-black text-slate-900">{{ page }} / {{ totalPages }}</span>
      <button 
        :disabled="page === totalPages" 
        @click="changePage(page + 1)"
        class="cursor-pointer p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 disabled:opacity-20 transition"
      >
        <ChevronRight :size="20" />
      </button>
    </div>
  </div>
</template>