/*
  Warnings:

  - The values [RETURN] on the enum `InventoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InventoryType_new" AS ENUM ('PURCHASE', 'SALE', 'DAMAGED', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RETURN_FROM_CUSTOMER', 'RETURN_TO_SUPPLIER');
ALTER TABLE "public"."Inventory" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Inventory" ALTER COLUMN "type" TYPE "InventoryType_new" USING ("type"::text::"InventoryType_new");
ALTER TYPE "InventoryType" RENAME TO "InventoryType_old";
ALTER TYPE "InventoryType_new" RENAME TO "InventoryType";
DROP TYPE "public"."InventoryType_old";
ALTER TABLE "Inventory" ALTER COLUMN "type" SET DEFAULT 'PURCHASE';
COMMIT;
