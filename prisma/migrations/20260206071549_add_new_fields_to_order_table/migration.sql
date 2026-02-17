-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('CUSTOMER', 'ADMIN');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancelledReason" VARCHAR(500),
ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'CUSTOMER',
ALTER COLUMN "rejectedReason" SET DATA TYPE VARCHAR(500);
