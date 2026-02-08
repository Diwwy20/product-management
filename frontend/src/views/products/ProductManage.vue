<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';

import { ProductService } from '@/services/product.service';
import { AppPath, DeleteMode } from '@/constants/constants';
import { getImageUrl } from '@/utils/format';
import type { IProduct, IPagination } from '@/interfaces/product.interface';

import { 
  Plus, Search, Edit2, Trash2, XCircle, 
  PackageSearch, Loader2, ChevronLeft, 
  ChevronRight, Image as ImageIcon 
} from 'lucide-vue-next';

import ConfirmModal from '@/components/ConfirmModal.vue';

const { t, locale } = useI18n();
const toast = useToast();
const router = useRouter();

const products = ref<IProduct[]>([]);
const pagination = ref<IPagination>({ page: 1, totalPages: 1, limit: 10, total: 0 });
const loading = ref<boolean>(false);
const searchQuery = ref<string>('');

const deleteModal = reactive({
  show: false,
  id: '',
  mode: DeleteMode.SOFT as DeleteMode,
  title: '',
  message: ''
});

const fetchProducts = async (page = 1) => {
  loading.value = true;
  try {
    const res = await ProductService.getAll({ page, search: searchQuery.value, limit: 10 });
    products.value = res.data;
    pagination.value = res.pagination;
  } catch (err) {
    toast.error(t('common.error'));
  } finally {
    loading.value = false;
  }
};

const triggerDelete = (id: string, mode: DeleteMode) => {
  deleteModal.id = id;
  deleteModal.mode = mode;
  deleteModal.title = mode === DeleteMode.HARD ? t('common.delete_hard') : t('common.delete');
  deleteModal.message = mode === DeleteMode.HARD ? t('common.delete_warning') : t('product.delete_confirm');
  deleteModal.show = true;
};

const handleConfirmDelete = async () => {
  try {
    deleteModal.show = false;
    loading.value = true;
    await ProductService.delete(deleteModal.id, deleteModal.mode);
    
    toast.success(
      deleteModal.mode === DeleteMode.HARD ? t('common.success') : t('category.delete_success')
    );
    fetchProducts(pagination.value.page);
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('common.error'));
  } finally {
    loading.value = false;
  }
};

const goToEdit = (id: string) => {
  const editPath = AppPath.PRODUCT_EDIT.replace(':id', id);
  router.push(editPath);
};

let debounceTimeout: ReturnType<typeof setTimeout>;
watch(searchQuery, () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => { fetchProducts(1); }, 500);
});

onMounted(() => fetchProducts());
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{{ t('product.title') }}</h1>
        <p class="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">{{ t('product.desc') }}</p>
      </div>
      <router-link :to="AppPath.PRODUCT_CREATE" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black shadow-xl shadow-blue-200 transition-all active:scale-95 text-sm uppercase tracking-widest">
        <Plus :size="20" /> {{ t('product.add_btn') }}
      </router-link>
    </div>

    <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
      <div class="relative flex-1 max-w-xl">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
        <input v-model="searchQuery" type="text" :placeholder="t('product.search_placeholder')" class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-700">
      </div>
    </div>

    <div class="bg-white rounded-[2.5rem] shadow-xl border border-slate-50 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th class="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{{ t('product.col_sku') }}</th>
              <th class="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{{ t('product.col_name') }}</th>
              <th class="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{{ t('product.col_category') }}</th>
              <th class="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">{{ t('product.col_price') }}</th>
              <th class="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">{{ t('product.col_stock') }}</th>
              <th class="p-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="loading"><td colspan="6" class="p-24 text-center"><Loader2 class="animate-spin mx-auto text-blue-600 mb-4" :size="48" /></td></tr>
            <tr v-else-if="products.length === 0"><td colspan="6" class="p-24 text-center"><PackageSearch class="mx-auto mb-4 opacity-10" :size="80" /></td></tr>
            
            <tr v-for="item in products" :key="item.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="p-6"><span class="bg-slate-100 px-3 py-1.5 rounded-xl font-mono text-[10px] font-black text-slate-500 uppercase">{{ item.sku }}</span></td>
              <td class="p-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-50 shadow-inner">
                    <img v-if="item.images?.length" :src="getImageUrl(item.images[0])" class="w-full h-full object-cover">
                    <ImageIcon v-else :size="18" class="text-slate-300" />
                  </div>
                  <div class="flex flex-col">
                    <p class="font-black text-slate-800 line-clamp-1 text-sm">{{ locale === 'th' ? item.nameTh : item.nameEn }}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ locale === 'th' ? item.nameEn : item.nameTh }}</p>
                  </div>
                </div>
              </td>
              <td class="p-6"><span class="text-xs font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-3 py-1 rounded-lg">{{ typeof item.categoryId === 'object' ? (locale === 'th' ? item.categoryId.nameTh : item.categoryId.nameEn) : '-' }}</span></td>
              <td class="p-6 text-right font-black text-slate-900 text-lg">฿{{ item.price.toLocaleString() }}</td>
              <td class="p-6 text-center"><div :class="item.stock > 10 ? 'text-green-600 bg-green-50' : item.stock > 0 ? 'text-orange-500 bg-orange-50' : 'text-red-600 bg-red-50'" class="inline-block px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">{{ item.stock }}</div></td>
              <td class="p-6">
                <div class="flex items-center justify-center gap-1">
                  <button @click="goToEdit(item.id)" class="cursor-pointer p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[1.2rem] transition-all active:scale-90"><Edit2 :size="18" /></button>
                  
                  <button @click="triggerDelete(item.id, DeleteMode.SOFT)" class="cursor-pointer p-3 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-[1.2rem] transition-all active:scale-90"><Trash2 :size="18" /></button>
                  <button @click="triggerDelete(item.id, DeleteMode.HARD)" class="cursor-pointer p-3 text-slate-200 hover:text-red-600 hover:bg-red-50 rounded-[1.2rem] transition-all active:scale-90"><XCircle :size="18" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="pagination.totalPages > 1" class="p-8 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
        <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{{ t('home.total_items') }}: {{ pagination.total }}</p>
        <div class="flex items-center gap-3">
          <button :disabled="pagination.page === 1" @click="fetchProducts(pagination.page - 1)" class="cursor-pointer p-3 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-20 transition shadow-sm active:scale-90"><ChevronLeft :size="20" /></button>
          <div class="bg-white border-2 border-slate-100 px-6 py-2.5 rounded-2xl font-black text-slate-900 shadow-sm text-sm">{{ pagination.page }} / {{ pagination.totalPages }}</div>
          <button :disabled="pagination.page === pagination.totalPages" @click="fetchProducts(pagination.page + 1)" class="cursor-pointer p-3 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-20 transition shadow-sm active:scale-90"><ChevronRight :size="20" /></button>
        </div>
      </div>
    </div>

    <ConfirmModal 
      :is-open="deleteModal.show"
      :title="deleteModal.title"
      :message="deleteModal.message"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      :variant="deleteModal.mode === DeleteMode.HARD ? 'danger' : 'warning'"
      @confirm="handleConfirmDelete"
      @cancel="deleteModal.show = false"
    />
  </div>
</template>