<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';

import { ProductService } from '@/services/product.service';
import { CategoryService } from '@/services/category.service';
import { AppPath } from '@/constants/constants';
import { getImageUrl } from '@/utils/format';

import type { ICategory } from '@/interfaces/category.interface';
import type { IProductInput } from '@/interfaces/product.interface';

import { 
  Save, ArrowLeft, Loader2, 
  X, Image as  Package, 
   UploadCloud 
} from 'lucide-vue-next';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const isEdit = ref<boolean>(false);
const loading = ref<boolean>(false);
const categories = ref<ICategory[]>([]);

const form = reactive<IProductInput>({
  sku: '',
  categoryId: '',
  nameTh: '',
  nameEn: '',
  price: 0,
  stock: 0,
  descriptionTh: '',
  descriptionEn: '',
});

const selectedFiles = ref<File[]>([]);
const previews = ref<string[]>([]);
const existingImages = ref<string[]>([]); 

const fetchData = async () => {
  try {
    const catRes = await CategoryService.getAll({ limit: 100 });
    categories.value = catRes.data;
    
    if (route.params.id) {
      isEdit.value = true;
      const product = await ProductService.getById(route.params.id as string);
      
      Object.assign(form, {
        sku: product.sku,
        nameTh: product.nameTh,
        nameEn: product.nameEn,
        price: product.price,
        stock: product.stock,
        descriptionTh: product.descriptionTh || '',
        descriptionEn: product.descriptionEn || '',
        categoryId: typeof product.categoryId === 'object' ? product.categoryId.id : product.categoryId
      });

      if (product.images) {
        existingImages.value = product.images;
      }
    }
  } catch (err) {
    toast.error(t('common.error'));
    router.push(AppPath.MANAGE_PRODUCTS);
  }
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    
    if (selectedFiles.value.length + files.length > 5) {
      toast.warning(t('product.error_max_images'));
      return;
    }

    selectedFiles.value.push(...files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    previews.value.push(...newPreviews);
  }
};

const removeSelectedFile = (index: number) => {
  const urlToRevoke = previews.value[index];
  if (urlToRevoke) {
    URL.revokeObjectURL(urlToRevoke);
  }
  selectedFiles.value.splice(index, 1);
  previews.value.splice(index, 1);
};

const handleSubmit = async () => {
  if (!form.sku || !form.categoryId || !form.nameTh || !form.nameEn) {
    toast.warning(t('auth.error_fill_form'));
    return;
  }

  loading.value = true;
  try {
    if (isEdit.value) {
      await ProductService.update(route.params.id as string, form, selectedFiles.value);
      toast.success(t('product.save_success'));
    } else {
      await ProductService.create(form, selectedFiles.value);
      toast.success(t('product.save_success'));
    }
    router.push(AppPath.MANAGE_PRODUCTS);
  } catch (err: any) {
    toast.error(err.response?.data?.message || t('common.error'));
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8 py-10 px-4">
    <div class="flex items-center gap-6">
      <button 
        @click="router.back()" 
        class="cursor-pointer p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition shadow-sm active:scale-90"
      >
        <ArrowLeft :size="24" class="text-slate-600" />
      </button>
      <div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
          {{ isEdit ? t('product.form_title_edit') : t('product.form_title_add') }}
        </h1>
        <p class="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">
          Product Information System
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-4">
            {{ t('product.label_images') }}
          </label>
          
          <div class="space-y-4">
            <label class="w-full aspect-square rounded-[2rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden relative">
              <UploadCloud :size="48" class="text-slate-200 group-hover:text-blue-500 group-hover:-translate-y-2 transition-all" />
              <span class="text-[10px] font-black uppercase text-slate-400 mt-2 group-hover:text-blue-600">
                {{ t('product.add_image') }}
              </span>
              <input type="file" multiple class="hidden" accept="image/*" @change="onFileChange">
            </label>

            <div class="grid grid-cols-3 gap-3">
              <div v-for="(src, idx) in previews" :key="idx" class="relative aspect-square group">
                <img :src="src" class="w-full h-full object-cover rounded-2xl shadow-md">
                <button 
                  type="button" 
                  @click="removeSelectedFile(idx)"
                  class="cursor-pointer absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X :size="14" />
                </button>
              </div>
              
              <div v-for="(src, idx) in existingImages" :key="'ex-'+idx" class="aspect-square opacity-50 grayscale hover:grayscale-0 transition-all">
                <img :src="getImageUrl(src)" class="w-full h-full object-cover rounded-2xl shadow-sm border border-slate-100">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-50 space-y-8">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('product.label_sku') }}</label>
              <div class="relative">
                <Package class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" :size="18" />
                <input v-model="form.sku" type="text" :disabled="isEdit" class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black uppercase disabled:opacity-50">
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('product.label_category') }}</label>
              <select v-model="form.categoryId" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold appearance-none cursor-pointer" required>
                <option value="">{{ t('product.select_category') }}</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">
                  {{ locale === 'th' ? c.nameTh : c.nameEn }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('product.label_name_th') }}</label>
              <input v-model="form.nameTh" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" required>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('product.label_name_en') }}</label>
              <input v-model="form.nameEn" type="text" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-bold" required>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('product.label_price') }}</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 italic">฿</span>
                <input v-model.number="form.price" type="number" step="0.01" class="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-lg" required>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('product.label_stock') }}</label>
              <input v-model.number="form.stock" type="number" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-lg" required>
            </div>
          </div>

          <div class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('product.label_desc_th') }}</label>
              <textarea v-model="form.descriptionTh" rows="3" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"></textarea>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{{ t('product.label_desc_en') }}</label>
              <textarea v-model="form.descriptionEn" rows="3" class="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"></textarea>
            </div>
          </div>

          <div class="flex items-center gap-4 pt-6">
            <button 
              type="button" 
              @click="router.back()"
              class="cursor-pointer px-8 py-5 border-2 border-slate-100 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition active:scale-95"
            >
              {{ t('common.cancel') }}
            </button>
            <button 
              :disabled="loading" 
              type="submit" 
              class="cursor-pointer flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Loader2 v-if="loading" class="animate-spin" :size="20" />
              <Save v-else :size="20" />
              {{ isEdit ? t('common.save') : t('product.add_btn') }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
textarea {
  resize: none;
}
</style>