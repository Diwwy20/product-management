import { Document, Types } from "mongoose";
import { UserRole } from "../constants/roles";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  nickName?: string;
  profileImage?: string;
  phoneNumber?: string;
  address?: string;
  role: UserRole;
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpiry?: Date | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
