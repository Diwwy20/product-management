<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { CategoryService } from '@/services/category.service';
import { DeleteMode } from '@/constants/constants';
import type { ICategory, ICategoryInput, IPagination } from '@/interfaces/category.interface';
import { 
  Plus, Search, Edit2, Trash2, Loader2, 
  ChevronLeft, ChevronRight, X, Save, Tag 
} from 'lucide-vue-next';

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

const handleDelete = async (item: ICategory) => {
  const displayName = locale.value === 'th' ? item.nameTh : item.nameEn;
  if (!confirm(t('category.delete_confirm', { name: displayName }))) return;
  
  try {
    await CategoryService.delete(item.id, DeleteMode.SOFT);
    toast.success(t('category.delete_success'));
    fetchCategories(pagination.value.page);
  } catch (err) {
    toast.error(t('common.error'));
  }
};

onMounted(() => fetchCategories());

let debounce: ReturnType<typeof setTimeout>;
watch(searchQuery, () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => fetchCategories(1), 500);
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tighter">{{ t('category.title') }}</h1>
        <p class="text-slate-400 text-sm font-bold">{{ t('category.desc') }}</p>
      </div>

      <button 
        @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black shadow-lg shadow-blue-100 transition-all active:scale-95 cursor-pointer"
      >
        <Plus :size="20" /> {{ t('category.add_btn') }}
      </button>
    </div>

    <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
      <div class="relative max-w-md">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="20" />
        <input 
          v-model="searchQuery"
          type="text" 
          :placeholder="t('category.search_placeholder')"
          class="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
        >
      </div>
    </div>

    <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th class="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">{{ t('category.col_name_th') }}</th>
              <th class="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">{{ t('category.col_name_en') }}</th>
              <th class="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">{{ t('category.col_status') }}</th>
              <th class="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">{{ t('category.col_actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="loading">
              <td colspan="4" class="p-20 text-center">
                <Loader2 class="animate-spin mx-auto text-blue-600" :size="40" />
              </td>
            </tr>
            <tr v-else-if="categories.length === 0">
              <td colspan="4" class="p-20 text-center text-slate-300">
                <Tag class="mx-auto mb-4 opacity-20" :size="64" />
                <p class="font-bold">{{ t('category.no_data') }}</p>
              </td>
            </tr>
            <tr v-for="item in categories" :key="item.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="p-6 font-bold text-slate-800">{{ item.nameTh }}</td>
              <td class="p-6 text-slate-500 font-medium">{{ item.nameEn }}</td>
              <td class="p-6 text-center">
                <span 
                  class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                  :class="item.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
                >
                  {{ item.isActive ? t('category.status_active') : t('category.status_inactive') }}
                </span>
              </td>
              <td class="p-6">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openModal(item)" class="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer">
                    <Edit2 :size="18" />
                  </button>
                  <button @click="handleDelete(item)" class="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                    <Trash2 :size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.totalPages > 1" class="p-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
        <span class="text-sm font-bold text-slate-400">
          {{ t('home.total_items') }}: {{ pagination.total }}
        </span>
        <div class="flex items-center gap-2">
          <button :disabled="pagination.page === 1" @click="fetchCategories(pagination.page - 1)" class="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition cursor-pointer">
            <ChevronLeft :size="18" />
          </button>
          <span class="px-4 font-black text-slate-800">{{ pagination.page }} / {{ pagination.totalPages }}</span>
          <button :disabled="pagination.page === pagination.totalPages" @click="fetchCategories(pagination.page + 1)" class="cursor-pointer p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition">
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div class="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-xl font-black text-slate-900 uppercase">
            {{ isEditMode ? t('category.form_title_edit') : t('category.form_title_add') }}
          </h3>
          <button @click="closeModal" class="cursor-pointer p-2 hover:bg-slate-100 rounded-full transition">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('category.label_name_th') }}</label>
              <input v-model="form.nameTh" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold" required>
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('category.label_name_en') }}</label>
              <input v-model="form.nameEn" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold" required>
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('category.label_desc_th') }}</label>
            <textarea v-model="form.descriptionTh" rows="2" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold"></textarea>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('category.label_desc_en') }}</label>
            <textarea v-model="form.descriptionEn" rows="2" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none font-bold"></textarea>
          </div>
          <button type="submit" class="cursor-pointer w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
            <Save :size="20" /> {{ t('common.save') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>