import api from "@/api/axios";
import { DeleteMode } from "@/constants/constants";
import type {
  ICategory,
  ICategoryInput,
  ICategoryResponse,
} from "@/interfaces/category.interface";

export const CategoryService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ICategoryResponse> {
    const { data } = await api.get<ICategoryResponse>("/categories", {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<ICategory> {
    const { data } = await api.get<{ success: boolean; data: ICategory }>(
      `/categories/${id}`,
    );
    return data.data;
  },

  async create(payload: ICategoryInput): Promise<ICategory> {
    const { data } = await api.post<{ success: boolean; data: ICategory }>(
      "/categories",
      payload,
    );
    return data.data;
  },

  async update(
    id: string,
    payload: Partial<ICategoryInput>,
  ): Promise<ICategory> {
    const { data } = await api.put<{ success: boolean; data: ICategory }>(
      `/categories/${id}`,
      payload,
    );
    return data.data;
  },

  async delete(id: string, mode: DeleteMode = DeleteMode.SOFT): Promise<void> {
    await api.delete(`/categories/${id}`, { params: { mode } });
  },
};
