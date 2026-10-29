import { z } from "zod";

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(200),
  contactNumber: z.string().trim().min(7).max(30),
  deliveryAddress: z.string().trim().min(5),
  city: z.string().trim().min(2).max(100),
  deliveryNotes: z.string().trim().max(2000).optional(),

  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1)
    .max(50),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING_PAYMENT",
    "PAYMENT_SUBMITTED",
    "PAYMENT_VERIFIED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const verifyPaymentSchema = z.object({
  action: z.enum(["VERIFY", "REJECT"]),
  paymentTransactionRef: z.string().trim().max(150).optional(),
  paymentAdminNote: z.string().trim().max(2000).optional(),
});