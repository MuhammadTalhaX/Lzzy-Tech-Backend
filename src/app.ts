import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

// Parse incoming JSON
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Lzzy Tech API is running",
  });
});

// Product API routes
app.use("/api/products", productRoutes);

// Authentication API routes
app.use("/api/auth", authRoutes);

// Order API routes
app.use("/api/orders", orderRoutes);

// Handle unknown routes (must come after all API routes)
app.use(notFoundHandler);

// Handle errors (must be last)
app.use(errorHandler);

export default app;
