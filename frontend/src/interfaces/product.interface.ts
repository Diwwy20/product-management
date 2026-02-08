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
}

export interface IProductResponse {
  success: boolean;
  data: IProduct[];
  pagination: IPagination;
}
