import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { AppError } from "../utils/appError";
import { HttpCode } from "../constants/httpCodes";
import mongoose from "mongoose";

const profileStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const rootDir = path.join(process.cwd(), "uploads/profile");

    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir, { recursive: true });
    }
    cb(null, rootDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

export const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      const error = new AppError(
        HttpCode.BAD_REQUEST,
        "อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น!",
      );
      cb(error as Error);
    }
  },
});

export const uploadProduct = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const { categoryId } = req.body;

        const folderName =
          categoryId && mongoose.Types.ObjectId.isValid(categoryId)
            ? categoryId.toString()
            : "uncategorized";

        const rootDir = path.join(process.cwd(), "uploads/product", folderName);

        if (!fs.existsSync(rootDir)) {
          fs.mkdirSync(rootDir, { recursive: true });
        }

        cb(null, rootDir);
      } catch (error) {
        cb(error as Error, "");
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `prod-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else
      cb(new AppError(HttpCode.BAD_REQUEST, "Only images are allowed!") as any);
  },
});
