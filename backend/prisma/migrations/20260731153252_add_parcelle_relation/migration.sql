-- CreateTable
CREATE TABLE "Parcelle" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "superficie" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parcelle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parcelle_reference_key" ON "Parcelle"("reference");

-- AddForeignKey
ALTER TABLE "Parcelle" ADD CONSTRAINT "Parcelle_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
