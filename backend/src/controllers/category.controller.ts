import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { HttpCode } from "../constants/httpCodes";

const categoryService = new CategoryService();

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await categoryService.getCategories(req.query);
    res.status(HttpCode.OK).json({
      success: true,
      ...result,
    });
  } catch (e) {
    next(e);
  }
};

export const getCategoryById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(HttpCode.OK).json({
      success: true,
      data: category,
    });
  } catch (e) {
    next(e);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(HttpCode.CREATED).json({
      success: true,
      data: category,
    });
  } catch (e) {
    next(e);
  }
};

export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body,
    );
    res.status(HttpCode.OK).json({
      success: true,
      data: category,
    });
  } catch (e) {
    next(e);
  }
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isHard = req.query.mode === "hard";
    await categoryService.deleteCategory(req.params.id, isHard);
    res.status(HttpCode.OK).json({
      success: true,
      message: `Category deleted successfully (${isHard ? "hard" : "soft"})`,
    });
  } catch (e) {
    next(e);
  }
};
