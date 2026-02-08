import { CategoryRepository } from "../repositories/category.repository";
import {
  ICategory,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryQueryParams,
  PaginationResult,
} from "../interfaces/category.interface";
import { AppError } from "../utils/appError";
import { HttpCode } from "../constants/httpCodes";

export class CategoryService {
  private categoryRepo = new CategoryRepository();

  async getCategories(
    query: CategoryQueryParams,
  ): Promise<PaginationResult<ICategory>> {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 10));
    const skip = (page - 1) * limit;

    const filter = {
      deletedAt: null,
      ...(query.search && {
        $or: [
          { nameEn: { $regex: query.search, $options: "i" } },
          { nameTh: { $regex: query.search, $options: "i" } },
          { descriptionEn: { $regex: query.search, $options: "i" } },
          { descriptionTh: { $regex: query.search, $options: "i" } },
        ],
      }),
    };

    const { data, total } = await this.categoryRepo.findAll(
      filter,
      skip,
      limit,
    );

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCategoryById(id: string): Promise<ICategory> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new AppError(HttpCode.NOT_FOUND, "Category not found");
    }
    return category;
  }

  async createCategory(data: CreateCategoryDTO): Promise<ICategory> {
    const existing = await this.categoryRepo.findOne({
      deletedAt: null,
      $or: [{ nameEn: data.nameEn }, { nameTh: data.nameTh }],
    });

    if (existing) {
      throw new AppError(
        HttpCode.CONFLICT,
        "Category name already exists in EN or TH",
      );
    }

    return this.categoryRepo.create(data);
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryDTO,
  ): Promise<ICategory> {
    const category = await this.categoryRepo.update(id, data);
    if (!category) {
      throw new AppError(
        HttpCode.NOT_FOUND,
        "Category not found or already deleted",
      );
    }
    return category;
  }

  async deleteCategory(id: string, isHardDelete = false): Promise<void> {
    const result = isHardDelete
      ? await this.categoryRepo.hardDelete(id)
      : await this.categoryRepo.softDelete(id);

    if (!result) {
      throw new AppError(HttpCode.NOT_FOUND, "Category not found");
    }
  }
}
