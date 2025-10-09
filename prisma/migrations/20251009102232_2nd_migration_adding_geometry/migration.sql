/*
  Warnings:

  - You are about to drop the column `geom` on the `roads` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."roads_geom_gix";

-- AlterTable
ALTER TABLE "roads" DROP COLUMN "geom";
