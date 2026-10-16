
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import prisma from "../lib/prisma.js";
import {
  findAdminByAdminId,
  updateAdminCredentials,
} from "../repositories/admin.js";
import { hashPassword } from "../utils/password.js";

async function readHiddenPassword(): Promise<string> {
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    throw new Error(
      "Hidden password input requires an interactive terminal.",
    );
  }

  output.write("Enter new admin password (hidden): ");
  input.setRawMode(true);
  input.resume();
  input.setEncoding("utf8");

  return new Promise((resolve, reject) => {
    let password = "";

    const cleanup = () => {
      input.removeListener("data", onData);
      input.setRawMode(false);
      output.write("\n");
    };

    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\u0003") {
          cleanup();
          reject(new Error("Password input cancelled."));
          return;
        }

        if (char === "\r" || char === "\n") {
          cleanup();
          resolve(password);
          return;
        }

        if (char === "\u007f" || char === "\b") {
          password = password.slice(0, -1);
          continue;
        }

        if (char >= " " && char !== "\u007f") {
          password += char;
        }
      }
    };

    input.on("data", onData);
  });
}

async function main(): Promise<void> {
  const terminal = createInterface({ input, output });

  let currentAdminId: string;
  let newAdminId: string;

  try {
    currentAdminId = (
      await terminal.question("Enter current Admin ID: ")
    )
      .trim()
      .toUpperCase();

    newAdminId = (
      await terminal.question("Enter new Admin ID: ")
    )
      .trim()
      .toUpperCase();
  } finally {
    terminal.close();
  }

  if (!/^[A-Z0-9-]{3,50}$/.test(currentAdminId)) {
    throw new Error("Current Admin ID format is invalid.");
  }

  if (!/^[A-Z0-9-]{3,50}$/.test(newAdminId)) {
    throw new Error(
      "New Admin ID must be 3-50 characters and contain only letters, numbers, or hyphens.",
    );
  }

  const existingAdmin = await findAdminByAdminId(currentAdminId);

  if (!existingAdmin) {
    throw new Error(
      "Admin not found. Check the current Admin ID and try again.",
    );
  }

  const conflictingAdmin = await findAdminByAdminId(newAdminId);

  if (conflictingAdmin && conflictingAdmin.id !== existingAdmin.id) {
    throw new Error("The new Admin ID is already in use.");
  }

  const password = await readHiddenPassword();

  if (password.length === 0) {
    throw new Error("Password cannot be empty.");
  }

  if (password.length > 12) {
    throw new Error("Password must not exceed 12 characters.");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password must not exceed 72 UTF-8 bytes.");
  }

  const passwordHash = await hashPassword(password);

  await updateAdminCredentials(currentAdminId, {
    adminId: newAdminId,
    passwordHash,
  });

  console.log("Admin credentials updated successfully.");
  console.log(`Updated Admin ID: ${newAdminId}`);
}

main()
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error("Admin credential reset failed:", error.message);
    } else {
      console.error("Admin credential reset failed.");
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
