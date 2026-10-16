
import { z } from "zod";

export const loginSchema = z.object({
  adminId: z
    .string()
    .trim()
    .min(1, "Admin ID is required.")
    .max(50, "Admin ID must not exceed 50 characters."),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(100, "Password must not exceed 100 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;
