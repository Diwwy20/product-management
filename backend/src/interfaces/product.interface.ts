import { Document, Types } from "mongoose";

export interface IProduct extends Document {
  _id: Types.ObjectId;
  nameEn: string;
  nameTh: string;
  descriptionEn?: string;
  descriptionTh?: string;
  price: number;
  stock: number;
  sku: string;
  categoryId: Types.ObjectId;
  images: string[];
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
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

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  isActive?: string;
}
