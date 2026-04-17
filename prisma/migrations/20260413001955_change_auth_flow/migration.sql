/*
  Warnings:

  - You are about to drop the column `count` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `rememberToken` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `verifyToken` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `errorLoginCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `previousRandToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `randToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Setting` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiresAt` to the `Otp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Otp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');

-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "count",
DROP COLUMN "error",
DROP COLUMN "rememberToken",
DROP COLUMN "updatedAt",
DROP COLUMN "verifyToken",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "token" TEXT,
ADD COLUMN     "type" "OtpType" NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ALTER COLUMN "email" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "errorLoginCount",
DROP COLUMN "lastLogin",
DROP COLUMN "previousRandToken",
DROP COLUMN "randToken",
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "previousRefreshToken" TEXT,
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "refreshToken" TEXT NOT NULL,
ADD COLUMN     "rotateTokenAt" TIMESTAMP(3),
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "Setting";

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
