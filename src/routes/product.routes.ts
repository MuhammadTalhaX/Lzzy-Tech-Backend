import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { authenticateAdmin } from "../middleware/authenticate-admin.js";
import { validateBody } from "../middleware/validate.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";

const router = Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Admin-only routes
router.post(
  "/",
  authenticateAdmin,
  validateBody(createProductSchema),
  productController.createProduct,
);

router.put(
  "/:id",
  authenticateAdmin,
  validateBody(updateProductSchema),
  productController.updateProduct,
);

router.delete(
  "/:id",
  authenticateAdmin,
  productController.deleteProduct,
);

export default router;
