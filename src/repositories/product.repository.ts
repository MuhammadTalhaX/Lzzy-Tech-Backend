
import prisma from "../lib/prisma.js";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../schemas/product.schema.js";

const productInclude = {
  images: {
    orderBy: { sortOrder: "asc" as const },
  },
  specifications: true,
};

export const productRepository = {
  // Active products only: used by the public product listing.
  async findAll() {
    return prisma.product.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: "desc" },
      include: productInclude,
    });
  },

  // Archived products: use only for authenticated admin operations.
  async findArchived() {
    return prisma.product.findMany({
      where: { isArchived: true },
      orderBy: { archivedAt: "desc" },
      include: productInclude,
    });
  },

  // Public lookup: archived products are not visible.
  async findById(id: string) {
    return prisma.product.findFirst({
      where: { id, isArchived: false },
      include: productInclude,
    });
  },

  // Internal lookup for archive/restore operations.
  async findByIdIncludingArchived(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
  },

  async create(data: CreateProductInput) {
    const {
      images = [],
      specifications = [],
      ...productData
    } = data;

    const { seoTitle, metaDescription, ...requiredData } = productData;

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
      include: productInclude,
    });
  },

  async update(id: string, data: UpdateProductInput) {
    const {
      images = [],
      specifications = [],
      ...productData
    } = data;

    const { seoTitle, metaDescription, ...requiredData } = productData;

    return prisma.product.update({
      where: { id },
      data: {
        ...requiredData,
        seoTitle: seoTitle ?? null,
        metaDescription: metaDescription ?? null,
        images: {
          deleteMany: {},
          create: images.map((image) => ({
            url: image.url,
            isPrimary: image.isPrimary,
            sortOrder: image.sortOrder,
          })),
        },
        specifications: {
          deleteMany: {},
          create: specifications.map((specification) => ({
            key: specification.key,
            value: specification.value,
          })),
        },
      },
      include: productInclude,
    });
  },

  async archive(id: string) {
    return prisma.product.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
  },

  async restore(id: string) {
    return prisma.product.update({
      where: { id },
      data: {
        isArchived: false,
        archivedAt: null,
      },
      include: productInclude,
    });
  },

  async findBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
      select: { id: true, sku: true },
    });
  },

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });
  },
};
