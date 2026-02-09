<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';

import { ProductService } from '@/services/product.service';
import { CategoryService } from '@/services/category.service'; 
import { AppPath, DelayDebounce, DeleteMode } from '@/constants/constants';
import { getImageUrl } from '@/utils/format';
import type { IProduct, IPagination } from '@/interfaces/product.interface';
import type { ICategory } from '@/interfaces/category.interface';

import { 
  Plus, Search, Edit2, Trash2, Loader2, 
  ChevronLeft, ChevronRight, Image as ImageIcon,
  AlertCircle, PackageSearch, XCircle, Filter
} from 'lucide-vue-next';

import ConfirmModal from '@/components/ConfirmModal.vue';

const { t, locale } = useI18n();
const toast = useToast();
const router = useRouter();

const products = ref<IProduct[]>([]);
const categories = ref<ICategory[]>([]); 
const pagination = ref<IPagination>({ page: 1, totalPages: 1, limit: 10, total: 0 });
const loading = ref<boolean>(false);
const searchQuery = ref<string>('');
const selectedCategory = ref<string>(''); 

const deleteModal = reactive({
  show: false,
  id: '',
  title: '',
  message: ''
});

const fetchProducts = async (page = 1) => {
  loading.value = true;
  try {
    const res = await ProductService.getAll({ 
      page, 
      search: searchQuery.value, 
      categoryId: selectedCategory.value, 
      limit: 10 
    });
    products.value = res.data;
    pagination.value = res.pagination;
  } catch (err) {
    toast.error(t('common.error'));
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const res = await CategoryService.getAll({ limit: 100 });
    categories.value = res.data;
  } catch (err) {
    console.error("Failed to load categories");
  }
};

const handleToggleStatus = async (item: IProduct) => {
  try {
    const newStatus = !item.isActive;
    await ProductService.update(item.id, { isActive: newStatus });
    toast.success(newStatus ? t('product.activate_success') : t('product.deactivate_success'));
    item.isActive = newStatus;
  } catch (err: any) {
    toast.error(t('common.error'));
  }
};

const triggerHardDelete = (item: IProduct) => {
  const displayName = locale.value === 'th' ? item.nameTh : item.nameEn;
  deleteModal.id = item.id;
  deleteModal.title = t('common.delete_hard');
  deleteModal.message = t('product.delete_hard_confirm', { name: displayName });
  deleteModal.show = true;
};

const handleConfirmHardDelete = async () => {
  try {
    deleteModal.show = false;
    loading.value = true;
    await ProductService.delete(deleteModal.id, DeleteMode.HARD);
    toast.success('ลบสินค้าถาวรเรียบร้อยแล้ว');
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
watch([searchQuery, selectedCategory], () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => { fetchProducts(1); }, DelayDebounce.DELAY);
});

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-1">
        <h1 class="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{{ t('product.title') }}</h1>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          <AlertCircle :size="14" class="text-blue-500" /> {{ t('product.desc') }}
        </p>
      </div>
      <router-link :to="AppPath.PRODUCT_CREATE" class="bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] flex items-center gap-3 font-black shadow-xl transition-all active:scale-95 text-xs uppercase tracking-widest group">
        <Plus :size="20" class="group-hover:rotate-90 transition-transform duration-300" /> {{ t('product.add_btn') }}
      </router-link>
    </div>

    <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4">
      <div class="relative flex-1 w-full">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="t('product.search_placeholder')" 
          class="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-[1.2rem] focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all"
        >
      </div>

      <div class="relative w-full md:w-72">
        <Filter class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
        <select 
          v-model="selectedCategory"
          class="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-[1.2rem] focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
        >
          <option value="">{{ t('home.all_categories') }}</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ locale === 'th' ? cat.nameTh : cat.nameEn }}
          </option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-white border-b border-slate-100">
            <tr>
              <th class="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{{ t('product.col_sku') }}</th>
              <th class="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{{ t('product.col_name') }}</th>
              <th class="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{{ t('product.col_category')}}</th>
              <th class="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">{{ t('product.col_sales_status') }}</th>
              <th class="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="loading"><td colspan="5" class="p-32 text-center"><Loader2 class="animate-spin mx-auto text-blue-600" :size="48" /></td></tr>
            <tr v-else-if="products.length === 0"><td colspan="5" class="p-32 text-center"><PackageSearch class="mx-auto mb-4 opacity-10" :size="80" /><p class="font-black uppercase tracking-widest text-slate-300">ไม่พบข้อมูลสินค้า</p></td></tr>
            
            <tr v-for="item in products" :key="item.id" class="hover:bg-slate-50/30 transition-colors group">
              <td class="p-8"><span class="bg-slate-100 px-3 py-1.5 rounded-xl font-mono text-[10px] font-black text-slate-500 uppercase tracking-tighter">{{ item.sku }}</span></td>
              <td class="p-8">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-50 shadow-inner">
                    <img v-if="item.images?.length" :src="getImageUrl(item.images[0])" class="w-full h-full object-cover">
                    <ImageIcon v-else :size="20" class="text-slate-300" />
                  </div>
                  <div class="flex flex-col">
                    <p class="font-black text-slate-800 text-sm line-clamp-1">{{ locale === 'th' ? item.nameTh : item.nameEn }}</p>
                    <p class="text-blue-600 font-black text-sm mt-1">฿{{ item.price.toLocaleString() }}</p>
                  </div>
                </div>
              </td>
              <td class="p-8">
                <div class="flex flex-col gap-1">
                  <span class="text-xs font-black text-slate-500 uppercase tracking-tight">
                    {{ (item.categoryId && typeof item.categoryId === 'object') ? (locale === 'th' ? item.categoryId.nameTh : item.categoryId.nameEn) : '-' }}
                  </span>
                  <span v-if="typeof item.categoryId === 'object' && item.categoryId?.isActive === false" class="text-[9px] font-bold text-red-400 uppercase italic flex items-center gap-1">
                    <XCircle :size="10" /> (หมวดหมู่ปิดอยู่)
                  </span>
                </div>
              </td>

              <td class="p-8 text-center">
                <div class="flex items-center justify-center">
                  <label :for="'toggle-prod-' + item.id" class="flex items-center cursor-pointer select-none">
                    <div class="relative">
                      <input type="checkbox" :id="'toggle-prod-' + item.id" class="sr-only" :checked="item.isActive" @change="handleToggleStatus(item)">
                      <div class="block w-14 h-8 rounded-full transition-colors duration-300 shadow-inner" :class="item.isActive ? 'bg-green-500' : 'bg-slate-200'"></div>
                      <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-md flex items-center justify-center" :class="item.isActive ? 'translate-x-6' : 'translate-x-0'">
                        <div v-if="item.isActive" class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </label>
                </div>
              </td>

              <td class="p-8 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button @click="goToEdit(item.id)" class="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[1.2rem] transition-all cursor-pointer active:scale-90 bg-slate-50 group/btn">
                    <Edit2 :size="18" class="group-hover/btn:scale-110 transition-transform" />
                  </button>
                  <button @click="triggerHardDelete(item)" class="p-4 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[1.2rem] transition-all cursor-pointer active:scale-90 bg-slate-50 group/btn">
                    <Trash2 :size="18" class="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.totalPages > 1" class="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          SHOWING {{ products.length }} OF {{ pagination.total }} PRODUCTS
        </span>
        <div class="flex items-center gap-2">
          <button :disabled="pagination.page === 1" @click="fetchProducts(pagination.page - 1)" class="cursor-pointer p-4 rounded-2xl bg-white border border-slate-100 hover:bg-slate-900 hover:text-white disabled:opacity-20 transition-all active:scale-90 shadow-sm"><ChevronLeft :size="20" /></button>
          <div class="bg-white border-2 border-slate-100 px-6 py-2.5 rounded-2xl font-black text-slate-900 shadow-sm text-xs tracking-widest">{{ pagination.page }} / {{ pagination.totalPages }}</div>
          <button :disabled="pagination.page === pagination.totalPages" @click="fetchProducts(pagination.page + 1)" class="cursor-pointer p-4 rounded-2xl bg-white border border-slate-100 hover:bg-slate-900 hover:text-white disabled:opacity-20 transition-all active:scale-90 shadow-sm"><ChevronRight :size="20" /></button>
        </div>
      </div>
    </div>

    <ConfirmModal 
      :is-open="deleteModal.show"
      :title="deleteModal.title"
      :message="deleteModal.message"
      :confirm-text="t('common.confirm_hard_delete')"
      :cancel-text="t('common.cancel')"
      variant="danger"
      @confirm="handleConfirmHardDelete"
      @cancel="deleteModal.show = false"
    />
  </div>
</template>

<style scoped>
.overflow-x-auto::-webkit-scrollbar { height: 6px; }
.overflow-x-auto::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
</style>