import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  nameEn: string;
  nameTh: string;
  descriptionEn?: string;
  descriptionTh?: string;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDTO {
  nameEn: string;
  nameTh: string;
  descriptionEn?: string;
  descriptionTh?: string;
}

export interface UpdateCategoryDTO {
  nameEn?: string;
  nameTh?: string;
  descriptionEn?: string;
  descriptionTh?: string;
  isActive?: boolean;
}

export interface CategoryQueryParams {
  page?: string;
  limit?: string;
  search?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
