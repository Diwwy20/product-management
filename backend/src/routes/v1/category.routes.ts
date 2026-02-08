import { Router } from "express";
import * as categoryController from "../../controllers/category.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { UserRole } from "../../constants/roles";
import {
  categoryValidator,
  handleValidationErrors,
} from "../../middlewares/validation.middleware";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

router.use(authenticate);

router.post(
  "/",
  authorize(UserRole.ADMIN),
  categoryValidator.create,
  handleValidationErrors,
  categoryController.createCategory,
);

router.put(
  "/:id",
  authorize(UserRole.ADMIN),
  categoryValidator.update,
  handleValidationErrors,
  categoryController.updateCategory,
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  categoryController.deleteCategory,
);

export default router;
