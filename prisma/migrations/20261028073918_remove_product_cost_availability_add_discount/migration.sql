/*
  Warnings:

  - You are about to drop the column `availability` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_availability_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "availability",
DROP COLUMN "cost",
ADD COLUMN     "discountedPrice" DECIMAL(12,2);
