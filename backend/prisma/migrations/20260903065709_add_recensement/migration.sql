-- CreateEnum
CREATE TYPE "SituationRecensement" AS ENUM ('VENDUE', 'DONNEE', 'PRISE_ANARCHIQUEMENT', 'A_VERIFIER', 'AUTRE');

-- CreateTable
CREATE TABLE "Recensement" (
    "id" SERIAL NOT NULL,
    "parcelleId" INTEGER NOT NULL,
    "situation" "SituationRecensement" NOT NULL,
    "occupantNom" TEXT,
    "occupantPrenom" TEXT,
    "occupantTelephone" TEXT,
    "occupantAdresse" TEXT,
    "familleId" INTEGER,
    "vendeurDonateurNom" TEXT,
    "vendeurDonateurPrenom" TEXT,
    "vendeurDonateurMembreId" INTEGER,
    "vendeurDonateurQualite" TEXT,
    "montantTotal" DECIMAL(15,2),
    "montantPaye" DECIMAL(15,2),
    "droitRevendique" TEXT,
    "cooperative" BOOLEAN NOT NULL DEFAULT true,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recensement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecensementDocument" (
    "id" SERIAL NOT NULL,
    "recensementId" INTEGER NOT NULL,
    "typeDocument" TEXT NOT NULL,
    "reference" TEXT,
    "dateDocument" TIMESTAMP(3),
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecensementDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecensementSignataire" (
    "id" SERIAL NOT NULL,
    "recensementId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "qualite" TEXT,
    "fonction" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecensementSignataire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecensementAutoriteEtat" (
    "id" SERIAL NOT NULL,
    "recensementId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "fonction" TEXT NOT NULL,
    "institution" TEXT,
    "telephone" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecensementAutoriteEtat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recensement_parcelleId_idx" ON "Recensement"("parcelleId");

-- CreateIndex
CREATE INDEX "Recensement_situation_idx" ON "Recensement"("situation");

-- CreateIndex
CREATE INDEX "Recensement_familleId_idx" ON "Recensement"("familleId");

-- CreateIndex
CREATE INDEX "Recensement_vendeurDonateurMembreId_idx" ON "Recensement"("vendeurDonateurMembreId");

-- CreateIndex
CREATE INDEX "RecensementDocument_recensementId_idx" ON "RecensementDocument"("recensementId");

-- CreateIndex
CREATE INDEX "RecensementSignataire_recensementId_idx" ON "RecensementSignataire"("recensementId");

-- CreateIndex
CREATE INDEX "RecensementAutoriteEtat_recensementId_idx" ON "RecensementAutoriteEtat"("recensementId");

-- CreateIndex
CREATE INDEX "RecensementAutoriteEtat_fonction_idx" ON "RecensementAutoriteEtat"("fonction");

-- CreateIndex
CREATE INDEX "RecensementAutoriteEtat_institution_idx" ON "RecensementAutoriteEtat"("institution");

-- AddForeignKey
ALTER TABLE "Recensement" ADD CONSTRAINT "Recensement_parcelleId_fkey" FOREIGN KEY ("parcelleId") REFERENCES "Parcelle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recensement" ADD CONSTRAINT "Recensement_familleId_fkey" FOREIGN KEY ("familleId") REFERENCES "FamilleFonciere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recensement" ADD CONSTRAINT "Recensement_vendeurDonateurMembreId_fkey" FOREIGN KEY ("vendeurDonateurMembreId") REFERENCES "MembreFamilleFonciere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecensementDocument" ADD CONSTRAINT "RecensementDocument_recensementId_fkey" FOREIGN KEY ("recensementId") REFERENCES "Recensement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecensementSignataire" ADD CONSTRAINT "RecensementSignataire_recensementId_fkey" FOREIGN KEY ("recensementId") REFERENCES "Recensement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecensementAutoriteEtat" ADD CONSTRAINT "RecensementAutoriteEtat_recensementId_fkey" FOREIGN KEY ("recensementId") REFERENCES "Recensement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
