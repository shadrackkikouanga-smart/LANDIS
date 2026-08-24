-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('ESPECES', 'MOBILE_MONEY', 'VIREMENT', 'CHEQUE');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('NON_PAYE', 'PARTIEL', 'PAYE');

-- CreateTable
CREATE TABLE "Paiement" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "modePaiement" TEXT NOT NULL,
    "reference" TEXT,
    "commentaire" TEXT,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Paiement"
ADD CONSTRAINT "Paiement_transactionId_fkey"
FOREIGN KEY ("transactionId")
REFERENCES "Transaction"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;