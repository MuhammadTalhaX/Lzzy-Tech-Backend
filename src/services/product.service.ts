
import { productRepository } from "../repositories/product.repository.js";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../schemas/product.schema.js";

export class ProductService {
  async getAllProducts() {
    return productRepository.findAll();
  }

  async getArchivedProducts() {
    return productRepository.findArchived();
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    return product;
  }

  async createProduct(data: CreateProductInput) {
    const existingSku = await productRepository.findBySku(data.sku);

    if (existingSku) {
      throw new Error("PRODUCT_SKU_ALREADY_EXISTS");
    }

    const existingSlug = await productRepository.findBySlug(data.slug);

    if (existingSlug) {
      throw new Error("PRODUCT_SLUG_ALREADY_EXISTS");
    }

    return productRepository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    const existingProduct = await productRepository.findById(id);

    if (!existingProduct) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const existingSku = await productRepository.findBySku(data.sku);

    if (existingSku && existingSku.id !== id) {
      throw new Error("PRODUCT_SKU_ALREADY_EXISTS");
    }

    const existingSlug = await productRepository.findBySlug(data.slug);

    if (existingSlug && existingSlug.id !== id) {
      throw new Error("PRODUCT_SLUG_ALREADY_EXISTS");
    }

    return productRepository.update(id, data);
  }

  async deleteProduct(id: string) {
    const product =
      await productRepository.findByIdIncludingArchived(id);

    if (!product || product.isArchived) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    await productRepository.archive(id);
  }

  async restoreProduct(id: string) {
    const product =
      await productRepository.findByIdIncludingArchived(id);

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (!product.isArchived) {
      throw new Error("PRODUCT_NOT_ARCHIVED");
    }

    return productRepository.restore(id);
  }
}

export const productService = new ProductService();
