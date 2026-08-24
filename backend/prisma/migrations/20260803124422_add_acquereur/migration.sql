/*
  Warnings:

  - Made the column `telephone` on table `Proprietaire` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Proprietaire_email_key";

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "location" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Proprietaire" ALTER COLUMN "telephone" SET NOT NULL;

-- CreateTable
CREATE TABLE "Acquereur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "adresse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Acquereur_pkey" PRIMARY KEY ("id")
);
