-- CreateEnum
CREATE TYPE "TypeDroitFamille" AS ENUM ('VENDRE', 'DONNER', 'AUTRE');

-- CreateTable
CREATE TABLE "FamilleFonciere" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "estPrincipale" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "terrainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilleFonciere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembreFamilleFonciere" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "qualite" TEXT NOT NULL,
    "observations" TEXT,
    "familleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembreFamilleFonciere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DroitFamilleFonciere" (
    "id" SERIAL NOT NULL,
    "type" "TypeDroitFamille" NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "familleId" INTEGER NOT NULL,
    "membreId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DroitFamilleFonciere_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FamilleFonciere_terrainId_idx" ON "FamilleFonciere"("terrainId");

-- CreateIndex
CREATE INDEX "FamilleFonciere_estPrincipale_idx" ON "FamilleFonciere"("estPrincipale");

-- CreateIndex
CREATE INDEX "MembreFamilleFonciere_familleId_idx" ON "MembreFamilleFonciere"("familleId");

-- CreateIndex
CREATE INDEX "MembreFamilleFonciere_nom_idx" ON "MembreFamilleFonciere"("nom");

-- CreateIndex
CREATE INDEX "MembreFamilleFonciere_qualite_idx" ON "MembreFamilleFonciere"("qualite");

-- CreateIndex
CREATE INDEX "DroitFamilleFonciere_familleId_idx" ON "DroitFamilleFonciere"("familleId");

-- CreateIndex
CREATE INDEX "DroitFamilleFonciere_membreId_idx" ON "DroitFamilleFonciere"("membreId");

-- CreateIndex
CREATE INDEX "DroitFamilleFonciere_type_idx" ON "DroitFamilleFonciere"("type");

-- CreateIndex
CREATE INDEX "DroitFamilleFonciere_actif_idx" ON "DroitFamilleFonciere"("actif");

-- AddForeignKey
ALTER TABLE "FamilleFonciere" ADD CONSTRAINT "FamilleFonciere_terrainId_fkey" FOREIGN KEY ("terrainId") REFERENCES "Terrain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreFamilleFonciere" ADD CONSTRAINT "MembreFamilleFonciere_familleId_fkey" FOREIGN KEY ("familleId") REFERENCES "FamilleFonciere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DroitFamilleFonciere" ADD CONSTRAINT "DroitFamilleFonciere_familleId_fkey" FOREIGN KEY ("familleId") REFERENCES "FamilleFonciere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DroitFamilleFonciere" ADD CONSTRAINT "DroitFamilleFonciere_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "MembreFamilleFonciere"("id") ON DELETE CASCADE ON UPDATE CASCADE;
