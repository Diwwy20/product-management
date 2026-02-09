<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { CategoryService } from '@/services/category.service';
import { DelayDebounce, DeleteMode } from '@/constants/constants';
import type { ICategory, ICategoryInput, IPagination } from '@/interfaces/category.interface';
import { 
  Plus, Search, Edit2, Trash2, Loader2, 
  ChevronLeft, ChevronRight, X, Save, Tag,
  Power, PowerOff
} from 'lucide-vue-next';

import ConfirmModal from '@/components/ConfirmModal.vue';

const { t, locale } = useI18n();
const toast = useToast();

const categories = ref<ICategory[]>([]);
const pagination = ref<IPagination>({ page: 1, totalPages: 1, limit: 10, total: 0 });
const loading = ref<boolean>(false);
const searchQuery = ref<string>('');
const isModalOpen = ref<boolean>(false);
const isEditMode = ref<boolean>(false);
const currentId = ref<string | null>(null);

const form = reactive<ICategoryInput>({
  nameEn: '',
  nameTh: '',
  descriptionEn: '',
  descriptionTh: ''
});

const deleteModal = reactive({
  show: false,
  id: '',
  title: '',
  message: ''
});

const fetchCategories = async (page = 1) => {
  loading.value = true;
  try {
    const res = await CategoryService.getAll({ page, search: searchQuery.value, limit: 10 });
    categories.value = res.data;
    pagination.value = res.pagination;
  } catch (err) {
    toast.error(t('common.error'));
  } finally {
    loading.value = false;
  }
};

const openModal = (item?: ICategory) => {
  if (item) {
    isEditMode.value = true;
    currentId.value = item.id;
    Object.assign(form, {
      nameEn: item.nameEn,
      nameTh: item.nameTh,
      descriptionEn: item.descriptionEn || '',
      descriptionTh: item.descriptionTh || ''
    });
  } else {
    isEditMode.value = false;
    currentId.value = null;
    Object.assign(form, { nameEn: '', nameTh: '', descriptionEn: '', descriptionTh: '' });
  }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = async () => {
  try {
    if (isEditMode.value && currentId.value) {
      await CategoryService.update(currentId.value, form);
    } else {
      await CategoryService.create(form);
    }
    toast.success(t('category.save_success'));
    closeModal();
    fetchCategories(pagination.value.page);
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('common.error'));
  }
};

const handleToggleStatus = async (item: ICategory) => {
  try {
    loading.value = true;
    const newStatus = !item.isActive;
    await CategoryService.update(item.id, { isActive: newStatus });
  
    toast.success(newStatus ? t('category.activate_success') : t('category.deactivate_success'));
    fetchCategories(pagination.value.page);
  } catch (err: any) {
    toast.error(t('common.error'));
  } finally {
    loading.value = false;
  }
};

const triggerHardDelete = (item: ICategory) => {
  const displayName = locale.value === 'th' ? item.nameTh : item.nameEn;
  deleteModal.id = item.id;
  deleteModal.title = t('common.delete_hard');
  deleteModal.message = t('category.delete_hard_confirm', { name: displayName });
  deleteModal.show = true;
};

const handleConfirmHardDelete = async () => {
  try {
    deleteModal.show = false;
    loading.value = true;
    await CategoryService.delete(deleteModal.id, DeleteMode.HARD);
    
    toast.success(t('category.delete_success'));
    fetchCategories(1);
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('common.error'));
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchCategories());

let debounce: ReturnType<typeof setTimeout>;
watch(searchQuery, () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => fetchCategories(1), DelayDebounce.DELAY);
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{{ t('category.title') }}</h1>
        <p class="text-slate-400 text-sm font-bold uppercase tracking-widest">{{ t('category.desc') }}</p>
      </div>

      <button 
        @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black shadow-xl shadow-blue-100 transition-all active:scale-95 cursor-pointer uppercase text-xs tracking-widest"
      >
        <Plus :size="20" /> {{ t('category.add_btn') }}
      </button>
    </div>

    <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
        <input 
          v-model="searchQuery"
          type="text" 
          :placeholder="t('category.search_placeholder')"
          class="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
        >
      </div>
    </div>

    <div class="bg-white rounded-[3rem] shadow-xl border border-slate-50 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th class="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{{ t('category.col_name_th') }}</th>
              <th class="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{{ t('category.col_name_en') }}</th>
              <th class="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">{{ t('category.col_status') }}</th>
              <th class="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="loading">
              <td colspan="4" class="p-32 text-center">
                <Loader2 class="animate-spin mx-auto text-blue-600" :size="48" />
              </td>
            </tr>
            <tr v-else-if="categories.length === 0">
              <td colspan="4" class="p-32 text-center text-slate-300">
                <Tag class="mx-auto mb-4 opacity-10" :size="80" />
                <p class="font-black uppercase tracking-widest">{{ t('category.no_data') }}</p>
              </td>
            </tr>
            <tr v-for="item in categories" :key="item.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="p-8 font-black text-slate-800">{{ item.nameTh }}</td>
              <td class="p-8 text-slate-500 font-bold uppercase text-xs tracking-wide">{{ item.nameEn }}</td>
              <td class="p-8 text-center">
                <span 
                  class="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2"
                  :class="item.isActive ? 'bg-green-100 text-green-600 shadow-sm shadow-green-50' : 'bg-slate-100 text-slate-400'"
                >
                  <div class="w-1.5 h-1.5 rounded-full" :class="item.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'"></div>
                  {{ item.isActive ? t('category.status_active') : t('category.status_inactive') }}
                </span>
              </td>
              <td class="p-8">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openModal(item)" class="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all cursor-pointer active:scale-90">
                    <Edit2 :size="18" />
                  </button>
                  
                  <button 
                    @click="handleToggleStatus(item)" 
                    class="p-3 rounded-2xl transition-all cursor-pointer active:scale-90"
                    :class="item.isActive ? 'text-slate-400 hover:text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'"
                    :title="item.isActive ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'"
                  >
                    <component :is="item.isActive ? PowerOff : Power" :size="18" />
                  </button>

                  <button @click="triggerHardDelete(item)" class="p-3 text-slate-200 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all cursor-pointer active:scale-90">
                    <Trash2 :size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.totalPages > 1" class="p-8 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {{ t('home.total_items') }}: {{ pagination.total }}
        </span>
        <div class="flex items-center gap-3">
          <button :disabled="pagination.page === 1" @click="fetchCategories(pagination.page - 1)" class="cursor-pointer p-3 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-20 transition active:scale-90 shadow-sm">
            <ChevronLeft :size="20" />
          </button>
          <div class="bg-white border-2 border-slate-100 px-6 py-2.5 rounded-2xl font-black text-slate-900 shadow-sm text-xs tracking-widest">
            {{ pagination.page }} / {{ pagination.totalPages }}
          </div>
          <button :disabled="pagination.page === pagination.totalPages" @click="fetchCategories(pagination.page + 1)" class="cursor-pointer p-3 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-20 transition active:scale-90 shadow-sm">
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal 
      :is-open="deleteModal.show"
      :title="deleteModal.title"
      :message="deleteModal.message"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      variant="danger"
      @confirm="handleConfirmHardDelete"
      @cancel="deleteModal.show = false"
    />

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">
        <div class="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-4">
            <div class="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
              <Tag :size="20" />
            </div>
            <h3 class="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
              {{ isEditMode ? t('category.form_title_edit') : t('category.form_title_add') }}
            </h3>
          </div>
          <button @click="closeModal" class="cursor-pointer p-2 hover:bg-white hover:shadow-md rounded-full transition-all active:scale-90">
            <X :size="20" class="text-slate-400" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-10 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('category.label_name_th') }}</label>
              <input v-model="form.nameTh" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold transition-all shadow-inner" required>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('category.label_name_en') }}</label>
              <input v-model="form.nameEn" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold transition-all shadow-inner" required>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('category.label_desc_th') }}</label>
            <textarea v-model="form.descriptionTh" rows="2" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold transition-all shadow-inner resize-none"></textarea>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('category.label_desc_en') }}</label>
            <textarea v-model="form.descriptionEn" rows="2" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold transition-all shadow-inner resize-none"></textarea>
          </div>
          
          <button type="submit" class="cursor-pointer w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] mt-4">
            <Save :size="20" /> {{ t('common.save') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
</style>