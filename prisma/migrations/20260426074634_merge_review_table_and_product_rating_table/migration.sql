/*
  Warnings:

  - You are about to drop the `ProductRating` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rating` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductRating" DROP CONSTRAINT "ProductRating_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductRating" DROP CONSTRAINT "ProductRating_userId_fkey";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "rating" SMALLINT NOT NULL;

-- DropTable
DROP TABLE "ProductRating";
