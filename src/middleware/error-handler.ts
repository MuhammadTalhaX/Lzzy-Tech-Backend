import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    return next(error);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  // Prisma database errors
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    res.status(409).json({
      success: false,
      message: "A record with this unique value already exists",
    });
    return;
  }

  // Product service errors
  if (error instanceof Error) {
    const knownErrors: Record<
      string,
      { status: number; message: string }
    > = {
      PRODUCT_NOT_FOUND: {
        status: 404,
        message: "Product not found",
      },
      PRODUCT_SKU_ALREADY_EXISTS: {
        status: 409,
        message: "A product with this SKU already exists",
      },
      PRODUCT_SLUG_ALREADY_EXISTS: {
        status: 409,
        message: "A product with this slug already exists",
      },
    };

    const knownError = knownErrors[error.message];

    if (knownError) {
      res.status(knownError.status).json({
        success: false,
        message: knownError.message,
      });
      return;
    }
  }

  // Unexpected server errors
  console.error("Unhandled API error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};