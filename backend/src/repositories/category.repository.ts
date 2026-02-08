import { CategoryModel } from "../models/category.model";
import type {
  ICategory,
  CreateCategoryDTO,
} from "../interfaces/category.interface";
import { UpdateQuery } from "mongoose";

type FindFilter<_T> = Record<string, unknown>;

export class CategoryRepository {
  async findAll(
    filter: FindFilter<ICategory>,
    skip: number,
    limit: number,
  ): Promise<{ data: ICategory[]; total: number }> {
    const mongooseFilter = filter;

    const [data, total] = await Promise.all([
      CategoryModel.find(mongooseFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CategoryModel.countDocuments(mongooseFilter),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<ICategory | null> {
    return CategoryModel.findById(id);
  }

  async findOne(filter: FindFilter<ICategory>): Promise<ICategory | null> {
    return CategoryModel.findOne(filter as any);
  }

  async create(data: CreateCategoryDTO): Promise<ICategory> {
    return CategoryModel.create(data);
  }

  async update(
    id: string,
    data: UpdateQuery<ICategory>,
  ): Promise<ICategory | null> {
    return CategoryModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(id: string): Promise<ICategory | null> {
    return CategoryModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), isActive: false },
      { new: true },
    );
  }

  async hardDelete(id: string): Promise<ICategory | null> {
    return CategoryModel.findByIdAndDelete(id);
  }
}
