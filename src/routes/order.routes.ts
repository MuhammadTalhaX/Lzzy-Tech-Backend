import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { createOrderSchema } from "../schemas/order.schema.js";
import { updateOrderStatusSchema } from "../schemas/order.schema.js";
import { updateOrderStatusController } from "../controllers/order.controller.js";
import { verifyPaymentSchema } from "../schemas/order.schema.js";
import { reviewOrderPaymentController } from "../controllers/order.controller.js";
import {
  createOrderController,
  getOrdersController,
  getOrderByIdController,
} from "../controllers/order.controller.js";
import { authenticateAdmin } from "../middleware/authenticate-admin.js";

const router = Router();

// Customer checkout: public endpoint
router.post("/", validateBody(createOrderSchema), createOrderController);

// Admin endpoints: authentication required
router.get("/", authenticateAdmin, getOrdersController);
router.get("/:id", authenticateAdmin, getOrderByIdController);
router.patch(
  "/:id/status",
  authenticateAdmin,
  validateBody(updateOrderStatusSchema),
  updateOrderStatusController,
);

router.patch(
  "/:id/payment",
  authenticateAdmin,
  validateBody(verifyPaymentSchema),
  reviewOrderPaymentController,
);


export default router;