import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { HttpCode } from "../constants/httpCodes";
import path from "path";

const productService = new ProductService();

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await productService.getProducts(req.query);
    res.status(HttpCode.OK).json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
};

export const getProductById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(HttpCode.OK).json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const images = (req.files as Express.Multer.File[])?.map((file) => {
      const parts = file.destination.split(path.sep);
      const folderName = parts[parts.length - 1];

      return `/uploads/product/${folderName}/${file.filename}`;
    });

    const product = await productService.createProduct({ ...req.body, images });

    res.status(HttpCode.CREATED).json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
};

export const updateProduct = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as Express.Multer.File[];
    let updateData = { ...req.body };

    if (files && files.length > 0) {
      const images = files.map((file) => {
        const parts = file.destination.split(path.sep);
        const folderName = parts[parts.length - 1];
        return `/uploads/product/${folderName}/${file.filename}`;
      });

      updateData.images = images;
    }

    const product = await productService.updateProduct(
      req.params.id,
      updateData,
    );

    res.status(HttpCode.OK).json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
};

export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isHard = req.query.mode === "hard";
    await productService.deleteProduct(req.params.id, isHard);
    res.status(HttpCode.OK).json({
      success: true,
      message: `Product deleted successfully (${isHard ? "hard" : "soft"})`,
    });
  } catch (e) {
    next(e);
  }
};
