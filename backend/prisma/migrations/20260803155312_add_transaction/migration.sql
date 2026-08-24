-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('RESERVATION', 'VENTE');

-- CreateEnum
CREATE TYPE "StatutTransaction" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'ANNULEE');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "parcelleId" INTEGER NOT NULL,
    "acquereurId" INTEGER NOT NULL,
    "type" "TypeTransaction" NOT NULL,
    "statut" "StatutTransaction" NOT NULL DEFAULT 'EN_ATTENTE',
    "prix" DOUBLE PRECISION,
    "dateTransaction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_parcelleId_fkey" FOREIGN KEY ("parcelleId") REFERENCES "Parcelle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_acquereurId_fkey" FOREIGN KEY ("acquereurId") REFERENCES "Acquereur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
