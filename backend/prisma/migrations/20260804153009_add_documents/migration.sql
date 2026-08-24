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

-- CreateIndex
CREATE UNIQUE INDEX "Document_numero_key" ON "Document"("numero");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
