
import prisma from "../lib/prisma.js";
import type { CreateProductInput } from "../schemas/product.schema.js";

export const productRepository = {
  async findAll() {
    return prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        specifications: true,
      },
    });
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        specifications: true,
      },
    });
  },

  async create(data: CreateProductInput) {
    const {
      images = [],
      specifications = [],
      ...productData
    } = data;

    const {
      seoTitle,
      metaDescription,
      ...requiredData
    } = productData;

    return prisma.product.create({
      data: {
        ...requiredData,
        seoTitle: seoTitle ?? null,
        metaDescription: metaDescription ?? null,
        images: {
          create: images.map((image) => ({
            url: image.url,
            isPrimary: image.isPrimary,
            sortOrder: image.sortOrder,
          })),
        },
        specifications: {
          create: specifications.map((specification) => ({
            key: specification.key,
            value: specification.value,
          })),
        },
      },
      include: {
        images: true,
        specifications: true,
      },
    });
  },

  async findBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
      select: {
        id: true,
        sku: true,
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
      },
    });
  },
};
