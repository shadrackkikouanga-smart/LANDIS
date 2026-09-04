/*
  Migration vers la relation plusieurs-à-plusieurs entre Bloc et Voie.

  Les anciennes colonnes Voie.blocId et Voie.position
  sont transférées dans BlocVoie avant leur suppression.
*/

-- 1. Créer la nouvelle table de liaison
CREATE TABLE "BlocVoie" (
    "id" SERIAL NOT NULL,
    "blocId" INTEGER NOT NULL,
    "voieId" INTEGER NOT NULL,
    "position" "PositionVoie" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlocVoie_pkey" PRIMARY KEY ("id")
);

-- 2. Créer les index
CREATE INDEX "BlocVoie_blocId_idx"
    ON "BlocVoie"("blocId");

CREATE INDEX "BlocVoie_voieId_idx"
    ON "BlocVoie"("voieId");

CREATE INDEX "BlocVoie_position_idx"
    ON "BlocVoie"("position");

CREATE UNIQUE INDEX "BlocVoie_blocId_voieId_key"
    ON "BlocVoie"("blocId", "voieId");

-- 3. Transférer les anciennes associations Voie → Bloc
INSERT INTO "BlocVoie" ("blocId", "voieId", "position", "updatedAt")
SELECT "blocId", "id", "position", CURRENT_TIMESTAMP
FROM "Voie"
WHERE "blocId" IS NOT NULL;

-- 4. Ajouter les nouvelles clés étrangères
ALTER TABLE "BlocVoie"
ADD CONSTRAINT "BlocVoie_blocId_fkey"
FOREIGN KEY ("blocId")
REFERENCES "Bloc"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "BlocVoie"
ADD CONSTRAINT "BlocVoie_voieId_fkey"
FOREIGN KEY ("voieId")
REFERENCES "Voie"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 5. Supprimer l'ancienne clé étrangère
ALTER TABLE "Voie"
DROP CONSTRAINT "Voie_blocId_fkey";

-- 6. Supprimer les anciens index
DROP INDEX "Voie_blocId_idx";
DROP INDEX "Voie_position_idx";

-- 7. Supprimer les anciennes colonnes
ALTER TABLE "Voie"
DROP COLUMN "blocId",
DROP COLUMN "position";