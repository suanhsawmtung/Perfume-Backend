/*
  Warnings:

  - You are about to drop the column `itemId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemType` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the `BundleSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BundleSetItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productVariantId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BundleSetItem" DROP CONSTRAINT "BundleSetItem_bundleSetId_fkey";

-- DropForeignKey
ALTER TABLE "BundleSetItem" DROP CONSTRAINT "BundleSetItem_productVariantId_fkey";

-- DropIndex
DROP INDEX "OrderItem_itemId_itemType_idx";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "itemId",
DROP COLUMN "itemType",
ADD COLUMN     "productVariantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "source";

-- DropTable
DROP TABLE "BundleSet";

-- DropTable
DROP TABLE "BundleSetItem";

-- DropEnum
DROP TYPE "BundleAudience";

-- DropEnum
DROP TYPE "OrderItemType";

-- DropEnum
DROP TYPE "VariantSource";

-- CreateIndex
CREATE INDEX "OrderItem_productVariantId_idx" ON "OrderItem"("productVariantId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
