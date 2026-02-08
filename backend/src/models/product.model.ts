import { Schema, model, Query } from "mongoose";
import { IProduct } from "../interfaces/product.interface";

const productSchema = new Schema<IProduct>(
  {
    nameEn: { type: String, required: true, trim: true, index: true },
    nameTh: { type: String, required: true, trim: true, index: true },
    descriptionEn: { type: String, trim: true },
    descriptionTh: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret;
        return {
          id: _id.toString(),
          ...rest,
        };
      },
    },
  },
);

productSchema.pre(/^find/, function (this: Query<unknown, IProduct>) {
  const filter = this.getFilter();
  if (filter.deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
});

export const ProductModel = model<IProduct>("Product", productSchema);
