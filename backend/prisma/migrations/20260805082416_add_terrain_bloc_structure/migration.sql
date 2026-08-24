/*
  Warnings:

  - You are about to drop the column `projectId` on the `Parcelle` table. All the data in the column will be lost.
  - Added the required column `blocId` to the `Parcelle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Parcelle" DROP CONSTRAINT "Parcelle_projectId_fkey";

-- AlterTable
ALTER TABLE "Parcelle" DROP COLUMN "projectId",
ADD COLUMN     "blocId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Terrain" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "superficie" DOUBLE PRECISION NOT NULL,
    "localisation" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Terrain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bloc" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "nombreParcelles" INTEGER NOT NULL,
    "terrainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bloc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Terrain_reference_key" ON "Terrain"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Bloc_reference_key" ON "Bloc"("reference");

-- AddForeignKey
ALTER TABLE "Terrain" ADD CONSTRAINT "Terrain_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bloc" ADD CONSTRAINT "Bloc_terrainId_fkey" FOREIGN KEY ("terrainId") REFERENCES "Terrain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcelle" ADD CONSTRAINT "Parcelle_blocId_fkey" FOREIGN KEY ("blocId") REFERENCES "Bloc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
