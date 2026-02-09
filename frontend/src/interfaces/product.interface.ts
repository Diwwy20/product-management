import type { ICategory } from "./category.interface";

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProduct {
  id: string;
  nameEn: string;
  nameTh: string;
  descriptionEn?: string;
  descriptionTh?: string;
  price: number;
  stock: number;
  sku: string;
  categoryId: ICategory | string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProductInput {
  nameEn: string;
  nameTh: string;
  descriptionEn?: string;
  descriptionTh?: string;
  price: number;
  stock: number;
  sku: string;
  categoryId: string;
  images?: string[];
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  categoryId?: string;
  isActive?: string | boolean;
  minPrice?: number | string;
  maxPrice?: number | string;
}

export interface IProductResponse {
  success: boolean;
  data: IProduct[];
  pagination: IPagination;
}
