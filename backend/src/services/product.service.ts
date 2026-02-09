import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";
import {
  IProduct,
  CreateProductDTO,
  UpdateProductDTO,
  ProductQueryParams,
} from "../interfaces/product.interface";
import { PaginationResult } from "../interfaces/category.interface";
import { AppError } from "../utils/appError";
import { HttpCode } from "../constants/httpCodes";

export class ProductService {
  private productRepo = new ProductRepository();
  private categoryRepo = new CategoryRepository();

  async getProducts(
    query: ProductQueryParams,
  ): Promise<PaginationResult<IProduct>> {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 10));
    const skip = (page - 1) * limit;

    const filter: any = {
      deletedAt: null,
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.isActive !== undefined && {
        isActive: query.isActive === "true",
      }),
      ...(query.search && {
        $or: [
          { nameEn: { $regex: query.search, $options: "i" } },
          { nameTh: { $regex: query.search, $options: "i" } },
          { sku: { $regex: query.search, $options: "i" } },
        ],
      }),
    };

    const { data, total } = await this.productRepo.findAll(filter, skip, limit);

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await this.productRepo.findById(id);
    if (!product) throw new AppError(HttpCode.NOT_FOUND, "Product not found");
    return product;
  }

  async createProduct(data: CreateProductDTO): Promise<IProduct> {
    const category = await this.categoryRepo.findById(data.categoryId);
    if (!category)
      throw new AppError(HttpCode.BAD_REQUEST, "Invalid categoryId");

    const existingSku = await this.productRepo.findOne({
      sku: data.sku.toUpperCase(),
    });
    if (existingSku)
      throw new AppError(HttpCode.CONFLICT, "SKU already exists");

    return this.productRepo.create(data);
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<IProduct> {
    if (data.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category)
        throw new AppError(HttpCode.BAD_REQUEST, "Invalid categoryId");
    }

    const product = await this.productRepo.update(id, data);
    if (!product) throw new AppError(HttpCode.NOT_FOUND, "Product not found");

    return product;
  }

  async deleteProduct(id: string, isHardDelete = false): Promise<void> {
    const result = isHardDelete
      ? await this.productRepo.hardDelete(id)
      : await this.productRepo.softDelete(id);

    if (!result) throw new AppError(HttpCode.NOT_FOUND, "Product not found");
  }
}
