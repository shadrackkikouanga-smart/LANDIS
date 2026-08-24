/*
  Warnings:

  - Added the required column `prenom` to the `Proprietaire` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proprietaire" ADD COLUMN     "prenom" TEXT NOT NULL;
