/*
  Warnings:

  - Added the required column `superficie` to the `Bloc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bloc" ADD COLUMN     "superficie" DOUBLE PRECISION NOT NULL;
