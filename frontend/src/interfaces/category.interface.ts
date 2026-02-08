export interface ICategory {
  id: string;
  nameEn: string;
  nameTh: string;
  descriptionEn?: string;
  descriptionTh?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryInput {
  nameEn: string;
  nameTh: string;
  descriptionEn?: string;
  descriptionTh?: string;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICategoryResponse {
  success: boolean;
  data: ICategory[];
  pagination: IPagination;
}
