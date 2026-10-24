
import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { authenticateAdmin } from "../middleware/authenticate-admin.js";
import { validateBody } from "../middleware/validate.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";

const router = Router();

// Public routes: active products only
router.get("/", productController.getAllProducts);

// Admin-only routes
router.get(
  "/archived",
  authenticateAdmin,
  productController.getArchivedProducts,
);

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

router.post(
  "/:id/restore",
  authenticateAdmin,
  productController.restoreProduct,
);

// Public product detail; archived products return not found
router.get("/:id", productController.getProductById);

export default router;
