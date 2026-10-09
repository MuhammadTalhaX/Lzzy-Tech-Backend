import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { validateBody } from "../middleware/validate.js";
import { createProductSchema } from "../schemas/product.schema.js";

const router = Router();

router.get("/", productController.getAllProducts);

router.get("/:id", productController.getProductById);

router.post(
  "/",
  validateBody(createProductSchema),
  productController.createProduct,
);

export default router;