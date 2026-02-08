import { ProductModel } from "../models/product.model";
import { IProduct, CreateProductDTO } from "../interfaces/product.interface";
import { UpdateQuery } from "mongoose";

type FindFilter<_T> = Record<string, unknown>;

export class ProductRepository {
  async findAll(
    filter: FindFilter<IProduct>,
    skip: number,
    limit: number,
  ): Promise<{ data: IProduct[]; total: number }> {
    const mongooseFilter = filter;

    const [data, total] = await Promise.all([
      ProductModel.find(mongooseFilter)
        .populate("categoryId", "nameEn nameTh")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProductModel.countDocuments(mongooseFilter),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<IProduct | null> {
    return ProductModel.findById(id).populate("categoryId");
  }

  async findOne(filter: FindFilter<IProduct>): Promise<IProduct | null> {
    return ProductModel.findOne(filter as any);
  }

  async create(data: CreateProductDTO): Promise<IProduct> {
    return ProductModel.create(data);
  }

  async update(
    id: string,
    data: UpdateQuery<IProduct>,
  ): Promise<IProduct | null> {
    return ProductModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(id: string): Promise<IProduct | null> {
    return ProductModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), isActive: false },
      { new: true },
    );
  }

  async hardDelete(id: string): Promise<IProduct | null> {
    return ProductModel.findByIdAndDelete(id);
  }
}
