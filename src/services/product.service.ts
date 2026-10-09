
import { productRepository } from "../repositories/product.repository.js";
import type { CreateProductInput } from "../schemas/product.schema.js";

export class ProductService {
  async getAllProducts() {
    return productRepository.findAll();
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
}

export const productService = new ProductService();
