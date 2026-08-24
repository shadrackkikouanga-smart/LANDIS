/*
  Warnings:

  - The `status` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[reference]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `area` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('EN_PREPARATION', 'EN_COURS', 'SUSPENDU', 'TERMINE');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "area" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'EN_PREPARATION';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Project_reference_key" ON "Project"("reference");
