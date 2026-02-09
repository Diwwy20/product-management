import api from "@/api/axios";
import { DeleteMode } from "@/constants/constants";
import type {
  IProduct,
  IProductInput,
  IProductResponse,
  ProductQueryParams,
} from "@/interfaces/product.interface";

export const ProductService = {
  async getAll(params: ProductQueryParams): Promise<IProductResponse> {
    const { data } = await api.get<IProductResponse>("/products", { params });
    return data;
  },

  async getById(id: string): Promise<IProduct> {
    const { data } = await api.get<{ success: boolean; data: IProduct }>(
      `/products/${id}`,
    );
    return data.data;
  },

  async create(payload: IProductInput, files: File[]): Promise<IProduct> {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    files.forEach((file) => formData.append("images", file));

    const { data } = await api.post<{ success: boolean; data: IProduct }>(
      "/products",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },

  async update(
    id: string,
    payload: Partial<IProductInput>,
    files?: File[],
  ): Promise<IProduct> {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    if (files) files.forEach((file) => formData.append("images", file));

    const { data } = await api.put<{ success: boolean; data: IProduct }>(
      `/products/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },

  async delete(id: string, mode: DeleteMode = DeleteMode.SOFT): Promise<void> {
    await api.delete(`/products/${id}`, { params: { mode } });
  },
};
