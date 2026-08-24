-- AlterTable
ALTER TABLE "Parcelle" ADD COLUMN     "proprietaireId" INTEGER;

-- CreateTable
CREATE TABLE "Proprietaire" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proprietaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proprietaire_email_key" ON "Proprietaire"("email");

-- AddForeignKey
ALTER TABLE "Parcelle" ADD CONSTRAINT "Parcelle_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;
