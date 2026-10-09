
import { z } from "zod";

const productAvailabilitySchema = z.enum([
  "AVAILABLE",
  "LIMITED",
  "OUT_OF_STOCK",
]);

const productImageSchema = z.object({
  url: z.string().trim().url("Image URL must be valid"),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

const productSpecificationSchema = z.object({
  key: z.string().trim().min(1).max(100),
  value: z.string().trim().min(1).max(500),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(200),
  sku: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(220),
  category: z.string().trim().min(1).max(100),
  brand: z.string().trim().min(1).max(100),

  price: z.number().finite().positive(),
  cost: z.number().finite().nonnegative(),

  availability: productAvailabilitySchema.default("AVAILABLE"),

  description: z.string().trim().min(1),

  seoTitle: z.string().trim().max(200).optional(),
  metaDescription: z.string().trim().max(320).optional(),

  images: z.array(productImageSchema).max(20).default([]),
  specifications: z.array(productSpecificationSchema).max(100).default([]),
}).strict().refine(
  (product) => product.price >= product.cost,
  {
    message: "Selling price must be greater than or equal to cost",
    path: ["price"],
  },
);

export type CreateProductInput = z.infer<typeof createProductSchema>;
