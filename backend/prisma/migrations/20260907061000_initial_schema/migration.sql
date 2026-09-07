-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('NON_PAYE', 'PARTIEL', 'PAYE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'DIRECTEUR', 'CHEF_PROJET', 'COMMERCIAL', 'GEOMETRE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('EN_PREPARATION', 'EN_COURS', 'SUSPENDU', 'TERMINE');

-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('RESERVATION', 'VENTE');

-- CreateEnum
CREATE TYPE "StatutTransaction" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatutBloc" AS ENUM ('EN_COURS', 'TERMINE');

-- CreateEnum
CREATE TYPE "TypeVoie" AS ENUM ('AVENUE', 'RUELLE', 'RUE', 'AUTRE');

-- CreateEnum
CREATE TYPE "PositionVoie" AS ENUM ('HAUT', 'BAS', 'GAUCHE', 'DROITE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeDroitFamille" AS ENUM ('VENDRE', 'DONNER', 'AUTRE');

-- CreateEnum
CREATE TYPE "SituationRecensement" AS ENUM ('VENDUE', 'DONNEE', 'PRISE_ANARCHIQUEMENT', 'A_VERIFIER', 'AUTRE');

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "reference" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL DEFAULT 'EN_PREPARATION',

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Terrain" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "superficie" DOUBLE PRECISION NOT NULL,
    "localisation" TEXT,
    "statut" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Terrain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "nom" TEXT,
    "superficie" DOUBLE PRECISION NOT NULL,
    "terrainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bloc" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "nombreParcelles" INTEGER NOT NULL,
    "superficie" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "statut" "StatutBloc" NOT NULL DEFAULT 'EN_COURS',
    "sectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bloc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voie" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "TypeVoie" NOT NULL,
    "largeur" DOUBLE PRECISION NOT NULL,
    "longueur" DOUBLE PRECISION NOT NULL,
    "superficie" DOUBLE PRECISION NOT NULL,
    "terrainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlocVoie" (
    "id" SERIAL NOT NULL,
    "blocId" INTEGER NOT NULL,
    "voieId" INTEGER NOT NULL,
    "position" "PositionVoie" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlocVoie_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Proprietaire" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "adresse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proprietaire_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Parcelle" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "superficie" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "proprietaireId" INTEGER,
    "dateAttribution" TIMESTAMP(3),
    "blocId" INTEGER NOT NULL,

    CONSTRAINT "Parcelle_pkey" PRIMARY KEY ("id")
);

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
    "statutPaiement" "StatutPaiement" NOT NULL DEFAULT 'NON_PAYE',

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

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
    "numeroRecu" TEXT NOT NULL,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "chemin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "pays" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historique" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "utilisateurId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historique_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Project_reference_key" ON "Project"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Terrain_reference_key" ON "Terrain"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Section_reference_key" ON "Section"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Bloc_reference_key" ON "Bloc"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Voie_reference_key" ON "Voie"("reference");

-- CreateIndex
CREATE INDEX "Voie_terrainId_idx" ON "Voie"("terrainId");

-- CreateIndex
CREATE INDEX "Voie_type_idx" ON "Voie"("type");

-- CreateIndex
CREATE INDEX "BlocVoie_blocId_idx" ON "BlocVoie"("blocId");

-- CreateIndex
CREATE INDEX "BlocVoie_voieId_idx" ON "BlocVoie"("voieId");

-- CreateIndex
CREATE INDEX "BlocVoie_position_idx" ON "BlocVoie"("position");

-- CreateIndex
CREATE UNIQUE INDEX "BlocVoie_blocId_voieId_key" ON "BlocVoie"("blocId", "voieId");

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

-- CreateIndex
CREATE UNIQUE INDEX "Parcelle_reference_key" ON "Parcelle"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_numeroRecu_key" ON "Paiement"("numeroRecu");

-- CreateIndex
CREATE UNIQUE INDEX "Document_numero_key" ON "Document"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "Historique_createdAt_idx" ON "Historique"("createdAt");

-- CreateIndex
CREATE INDEX "Historique_module_idx" ON "Historique"("module");

-- CreateIndex
CREATE INDEX "Historique_utilisateurId_idx" ON "Historique"("utilisateurId");

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
ALTER TABLE "Terrain" ADD CONSTRAINT "Terrain_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_terrainId_fkey" FOREIGN KEY ("terrainId") REFERENCES "Terrain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bloc" ADD CONSTRAINT "Bloc_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voie" ADD CONSTRAINT "Voie_terrainId_fkey" FOREIGN KEY ("terrainId") REFERENCES "Terrain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlocVoie" ADD CONSTRAINT "BlocVoie_blocId_fkey" FOREIGN KEY ("blocId") REFERENCES "Bloc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlocVoie" ADD CONSTRAINT "BlocVoie_voieId_fkey" FOREIGN KEY ("voieId") REFERENCES "Voie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilleFonciere" ADD CONSTRAINT "FamilleFonciere_terrainId_fkey" FOREIGN KEY ("terrainId") REFERENCES "Terrain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreFamilleFonciere" ADD CONSTRAINT "MembreFamilleFonciere_familleId_fkey" FOREIGN KEY ("familleId") REFERENCES "FamilleFonciere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DroitFamilleFonciere" ADD CONSTRAINT "DroitFamilleFonciere_familleId_fkey" FOREIGN KEY ("familleId") REFERENCES "FamilleFonciere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DroitFamilleFonciere" ADD CONSTRAINT "DroitFamilleFonciere_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "MembreFamilleFonciere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcelle" ADD CONSTRAINT "Parcelle_blocId_fkey" FOREIGN KEY ("blocId") REFERENCES "Bloc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcelle" ADD CONSTRAINT "Parcelle_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Proprietaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_acquereurId_fkey" FOREIGN KEY ("acquereurId") REFERENCES "Acquereur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_parcelleId_fkey" FOREIGN KEY ("parcelleId") REFERENCES "Parcelle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

