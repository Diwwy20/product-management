import { Router } from "express";
import * as productController from "../../controllers/product.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { UserRole } from "../../constants/roles";
import {
  productValidator,
  handleValidationErrors,
} from "../../middlewares/validation.middleware";
import { uploadProduct } from "../../middlewares/upload.middleware";

const router = Router();

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

router.use(authenticate);

router.post(
  "/",
  authorize(UserRole.ADMIN),
  uploadProduct.array("images", 3),
  productValidator.create,
  handleValidationErrors,
  productController.createProduct,
);

router.put(
  "/:id",
  authorize(UserRole.ADMIN),
  uploadProduct.array("images", 3),
  productValidator.update,
  handleValidationErrors,
  productController.updateProduct,
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  productController.deleteProduct,
);

export default router;
