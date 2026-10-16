
import type { Request, Response, NextFunction } from "express";

import { loginAdmin } from "../services/auth.service.js";
import type { LoginInput } from "../schemas/auth.schema.js";

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as LoginInput;
    const result = await loginAdmin(input);

    if (!result) {
      res.status(401).json({
        success: false,
        message: "Invalid Admin ID or password.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error: unknown) {
    next(error);
  }
}
