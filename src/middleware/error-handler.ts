
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  console.error("Unhandled API error:", err);

  const statusCode =
    typeof err?.statusCode === "number" &&
    err.statusCode >= 400 &&
    err.statusCode <= 599
      ? err.statusCode
      : 500;

  const message =
    statusCode !== 500 && typeof err?.message === "string"
      ? err.message
      : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
