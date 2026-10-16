
import jwt from "jsonwebtoken";

import { findAdminByAdminId } from "../repositories/admin.js";
import { verifyPassword } from "../utils/password.js";
import type { LoginInput } from "../schemas/auth.schema.js";

const JWT_EXPIRES_IN = "1h";

export interface LoginResult {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  admin: {
    id: string;
    adminId: string;
    role: string;
  };
}

export async function loginAdmin(
  input: LoginInput,
): Promise<LoginResult | null> {
  const admin = await findAdminByAdminId(input.adminId);

  if (!admin || !admin.isActive) {
    return null;
  }

  const passwordIsValid = await verifyPassword(
    input.password,
    admin.passwordHash,
  );

  if (!passwordIsValid) {
    return null;
  }

  const jwtSecret = process.env["JWT_SECRET"];

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const accessToken = jwt.sign(
    {
      adminId: admin.adminId,
      role: admin.role,
    },
    jwtSecret,
    {
      subject: admin.id,
      expiresIn: JWT_EXPIRES_IN,
      issuer: "lzzy-tech-api",
      audience: "lzzy-tech-admin",
    },
  );

  return {
    accessToken,
    tokenType: "Bearer",
    expiresIn: 3600,
    admin: {
      id: admin.id,
      adminId: admin.adminId,
      role: admin.role,
    },
  };
}
