import { Query, Schema, model } from "mongoose";
import { ICategory } from "../interfaces/category.interface";

const categorySchema = new Schema<ICategory>(
  {
    nameEn: {
      type: String,
      required: [true, "English name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    nameTh: {
      type: String,
      required: [true, "Thai name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    descriptionEn: {
      type: String,
      trim: true,
    },
    descriptionTh: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
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

categorySchema.pre(/^find/, function (this: Query<unknown, ICategory>) {
  const filter = this.getFilter();

  if (filter.deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
});

export const CategoryModel = model<ICategory>("Category", categorySchema);
