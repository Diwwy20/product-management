import { UserModel } from "../models/user.model";
import { IUser } from "../interfaces/user.interface";
import { UpdateQuery } from "mongoose";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async findByVerificationToken(token: string): Promise<IUser | null> {
    return await UserModel.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return await UserModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return await UserModel.create(data);
  }

  async update(id: string, data: UpdateQuery<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  }
}
