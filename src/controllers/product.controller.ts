
import type { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service.js";

export const productController = {
  async getAllProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.getAllProducts();

      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  },

  async getArchivedProducts(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const products = await productService.getArchivedProducts();

      res.status(200).json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  },

  async getProductById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const product = await productService.getProductById(
        req.params.id as string,
      );

      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.updateProduct(
        req.params.id as string,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteProduct(req.params.id as string);

      res.status(200).json({
        success: true,
        message: "Product archived successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async restoreProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.restoreProduct(
        req.params.id as string,
      );

      res.status(200).json({
        success: true,
        message: "Product restored successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },
};
