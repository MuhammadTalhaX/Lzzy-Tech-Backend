
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import prisma from "../lib/prisma.js";
import {
  createAdmin,
  findAdminByAdminId,
} from "../repositories/admin.js";
import { hashPassword } from "../utils/password.js";

async function main(): Promise<void> {
  const terminal = createInterface({ input, output });

  try {
    const adminId = (
      await terminal.question("Enter Admin ID")
    )
      .trim()
      .toUpperCase();

    const password = await terminal.question(
      "Enter admin password (input will be visible): ",
    );

    if (!/^[A-Za-z0-9-]{3,50}$/.test(adminId)) {
    throw new Error(
        "Admin ID must be 3-50 characters and contain only letters, numbers, or hyphens.",
    );
    }

    const passwordBytes = Buffer.byteLength(password, "utf8");

    if (password.length === 0) {
    throw new Error("Password cannot be empty.");
    }

    if (password.length > 12) {
    throw new Error("Password must not exceed 12 characters.");
    }

    if (passwordBytes > 72) {
    throw new Error("Password must not exceed 72 UTF-8 bytes.");
    }

    const existingAdmin = await findAdminByAdminId(adminId);

    if (existingAdmin) {
      throw new Error("This Admin ID already exists.");
    }

    const passwordHash = await hashPassword(password);

    await createAdmin({
      adminId,
      passwordHash,
    });

    console.log(`Admin ${adminId} created successfully.`);
  } finally {
    terminal.close();
  }
}

main()
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error("Admin creation failed:", error.message);
    } else {
      console.error("Admin creation failed due to an unknown error.");
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
