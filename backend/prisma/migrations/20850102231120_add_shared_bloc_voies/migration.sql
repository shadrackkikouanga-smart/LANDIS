/*
  Migration vers la relation plusieurs-à-plusieurs entre Bloc et Voie.

  Cette migration crée la structure finale des voies et la table de liaison
  BlocVoie sur une base neuve.
*/

-- 1. Créer les enums nécessaires

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'TypeVoie'
    ) THEN
        CREATE TYPE "TypeVoie" AS ENUM (
            'AVENUE',
            'RUELLE',
            'RUE',
            'AUTRE'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'PositionVoie'
    ) THEN
        CREATE TYPE "PositionVoie" AS ENUM (
            'HAUT',
            'BAS',
            'GAUCHE',
            'DROITE',
            'AUTRE'
        );
    END IF;
END
$$;

-- 2. Créer la table Voie

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

-- 3. Index de Voie

CREATE UNIQUE INDEX "Voie_reference_key"
    ON "Voie"("reference");

CREATE INDEX "Voie_terrainId_idx"
    ON "Voie"("terrainId");

CREATE INDEX "Voie_type_idx"
    ON "Voie"("type");

-- 4. Relation Voie → Terrain

ALTER TABLE "Voie"
ADD CONSTRAINT "Voie_terrainId_fkey"
FOREIGN KEY ("terrainId")
REFERENCES "Terrain"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 5. Créer la table de liaison BlocVoie

CREATE TABLE "BlocVoie" (
    "id" SERIAL NOT NULL,
    "blocId" INTEGER NOT NULL,
    "voieId" INTEGER NOT NULL,
    "position" "PositionVoie" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlocVoie_pkey" PRIMARY KEY ("id")
);

-- 6. Index BlocVoie

CREATE UNIQUE INDEX "BlocVoie_blocId_voieId_key"
    ON "BlocVoie"("blocId", "voieId");

CREATE INDEX "BlocVoie_blocId_idx"
    ON "BlocVoie"("blocId");

CREATE INDEX "BlocVoie_voieId_idx"
    ON "BlocVoie"("voieId");

CREATE INDEX "BlocVoie_position_idx"
    ON "BlocVoie"("position");

-- 7. Relations BlocVoie → Bloc / Voie

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