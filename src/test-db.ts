import "dotenv/config";
import prisma from "./lib/prisma.js";

async function main() {
  try {
    await prisma.$connect();

    const result = await prisma.$queryRaw<
      { current_database: string }[]
    >`SELECT current_database()`;

    console.log("Database connected successfully:", result[0]?.current_database);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();