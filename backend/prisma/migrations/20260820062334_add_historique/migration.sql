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

-- CreateIndex
CREATE INDEX "Historique_createdAt_idx" ON "Historique"("createdAt");

-- CreateIndex
CREATE INDEX "Historique_module_idx" ON "Historique"("module");

-- CreateIndex
CREATE INDEX "Historique_utilisateurId_idx" ON "Historique"("utilisateurId");

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
