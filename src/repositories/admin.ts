
import prisma from "../lib/prisma.js";

export async function findAdminByAdminId(adminId: string) {
  return prisma.admin.findUnique({
    where: { adminId },
  });
}

export async function createAdmin(data: {
  adminId: string;
  passwordHash: string;
}) {
  return prisma.admin.create({
    data: {
      adminId: data.adminId,
      passwordHash: data.passwordHash,
    },
  });
}

export async function updateAdminCredentials(
  currentAdminId: string,
  data: {
    adminId: string;
    passwordHash: string;
  },
) {
  return prisma.admin.update({
    where: { adminId: currentAdminId },
    data: {
      adminId: data.adminId,
      passwordHash: data.passwordHash,
    },
  });
}
