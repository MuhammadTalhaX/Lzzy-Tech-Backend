
import { z } from "zod";

const productImageSchema = z.object({
  url: z.string().trim().url("Image URL must be valid"),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

const productSpecificationSchema = z.object({
  key: z.string().trim().min(1).max(100),
  value: z.string().trim().min(1).max(500),
});

const productFields = {
  name: z.string().trim().min(1).max(200),
  sku: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(220),
  category: z.string().trim().min(1).max(100),
  brand: z.string().trim().min(1).max(100),
  price: z.number().finite().positive(),
  description: z.string().trim().min(1),
  seoTitle: z.string().trim().max(200).optional(),
  metaDescription: z.string().trim().max(320).optional(),
  images: z.array(productImageSchema).max(20).default([]),
  specifications: z.array(productSpecificationSchema).max(100).default([]),
};

export const createProductSchema = z
  .object({
    ...productFields,
    discountedPrice: z.number().finite().positive().optional(),
  })
  .strict()
  .refine(
    (product) =>
      product.discountedPrice === undefined ||
      product.discountedPrice < product.price,
    {
      message: "Discounted price must be lower than the selling price",
      path: ["discountedPrice"],
    },
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z
  .object({
    ...productFields,
    discountedPrice: z.number().finite().positive().nullable().optional(),
  })
  .strict()
  .refine(
    (product) =>
      product.discountedPrice == null ||
      product.discountedPrice < product.price,
    {
      message: "Discounted price must be lower than the selling price",
      path: ["discountedPrice"],
    },
  );

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
