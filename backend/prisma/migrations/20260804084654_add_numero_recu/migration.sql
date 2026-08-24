-- AlterTable
ALTER TABLE "Paiement" ADD COLUMN "numeroRecu" TEXT;

-- Génération des numéros de reçu pour les anciens paiements
UPDATE "Paiement"
SET "numeroRecu" = 'REC-' || LPAD(id::text, 6, '0');

-- Rendre la colonne obligatoire
ALTER TABLE "Paiement"
ALTER COLUMN "numeroRecu" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_numeroRecu_key" ON "Paiement"("numeroRecu");

-- DropEnum
DROP TYPE "ModePaiement";