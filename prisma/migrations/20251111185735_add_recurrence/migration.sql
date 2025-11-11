/*
  Warnings:

  - Changed the type of `assetType` on the `Asset` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "assetType",
ADD COLUMN     "assetType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "AssetType";
