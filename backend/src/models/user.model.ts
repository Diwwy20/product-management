import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/user.interface";
import { UserRole } from "../constants/roles";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    nickName: { type: String, trim: true },
    profileImage: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, __v, passwordHash, ...rest } = ret;
        return {
          id: _id.toString(),
          ...rest,
        };
      },
    },
  },
);

export const UserModel = model<IUser>("User", userSchema);
