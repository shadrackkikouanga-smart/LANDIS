import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateDocumentDto } from './dto/create-document.dto';

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly historiqueService: HistoriqueService,
  ) {}

  async create(createDocumentDto: CreateDocumentDto) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: createDocumentDto.transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction introuvable');
    }

    const dernierDocument = await this.prisma.document.findFirst({
      orderBy: { id: 'desc' },
    });

    const prochainNumero = dernierDocument ? dernierDocument.id + 1 : 1;
    const numero = `DOC-${String(prochainNumero).padStart(6, '0')}`;

    const document = await this.prisma.document.create({
      data: {
        numero,
        type: createDocumentDto.type,
        transactionId: createDocumentDto.transactionId,
        nomFichier: createDocumentDto.nomFichier,
        chemin: createDocumentDto.chemin,
      },
    });

    await this.historiqueService.create(
      'CREATION',
      'DOCUMENTS',
      `Création du document ${document.numero}`,
    );

    return document;
  }

  async findAll() {
    return this.prisma.document.findMany({
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { transaction: true },
    });

    if (!document) {
      throw new NotFoundException('Document introuvable');
    }

    return document;
  }

  async findByTransaction(transactionId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        acquereur: true,
        parcelle: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction introuvable');
    }

    const documents = await this.prisma.document.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
    });

    return {
      transaction: {
        id: transaction.id,
        type: transaction.type,
        prix: transaction.prix,
        statut: transaction.statut,
        statutPaiement: transaction.statutPaiement,
        acquereur: transaction.acquereur,
        parcelle: transaction.parcelle,
      },
      documents,
    };
  }

  async genererContratVente(transactionId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        acquereur: true,
        parcelle: true,
      },
    });

    if (!transaction || !transaction.parcelle || !transaction.acquereur) {
      throw new NotFoundException('Transaction, parcelle ou acquéreur introuvable pour générer le contrat');
    }

    const dossier = path.join(process.cwd(), 'documents', 'contrats');

    if (!fs.existsSync(dossier)) {
      fs.mkdirSync(dossier, { recursive: true });
    }

    const nomFichier = `contrat_${transaction.parcelle.reference}.pdf`;
    const cheminAbsolu = path.join(dossier, nomFichier);

    const documentExistant = await this.prisma.document.findFirst({
      where: {
        transactionId,
        type: 'CONTRAT_VENTE',
      },
    });

    if (documentExistant) {
      return documentExistant;
    }

    const pdf = new PDFDocument();
    const stream = fs.createWriteStream(cheminAbsolu);
    pdf.pipe(stream);

    pdf.fontSize(18).text('LANDIS', { align: 'center' });
    pdf.moveDown();
    pdf.fontSize(15).text('CONTRAT DE VENTE DE PARCELLE', { align: 'center' });
    pdf.moveDown(2);
    pdf.fontSize(12);

    pdf.text(`Acquéreur : ${transaction.acquereur.nom} ${transaction.acquereur.prenom}`);
    pdf.text(`Téléphone : ${transaction.acquereur.telephone}`);
    pdf.moveDown();
    pdf.text(`Parcelle : ${transaction.parcelle.reference}`);
    pdf.text(`Numéro : ${transaction.parcelle.numero}`);
    pdf.text(`Superficie : ${transaction.parcelle.superficie} m²`);
    pdf.moveDown();
    pdf.text(`Prix de vente : ${transaction.prix} FCFA`);
    pdf.text(`Statut : ${transaction.statut}`);
    pdf.text(`Paiement : ${transaction.statutPaiement}`);
    pdf.moveDown(2);
    pdf.text('Signature vendeur : __________________');
    pdf.text('Signature acquéreur : ________________');
    pdf.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    });

    const dernierDocument = await this.prisma.document.findFirst({
      orderBy: { id: 'desc' },
    });

    const prochainNumero = dernierDocument ? dernierDocument.id + 1 : 1;
    const numero = `DOC-${String(prochainNumero).padStart(6, '0')}`;

    const document = await this.prisma.document.create({
      data: {
        numero,
        type: 'CONTRAT_VENTE',
        transactionId,
        nomFichier,
        chemin: cheminAbsolu,
      },
    });

    await this.historiqueService.create(
      'GENERATION',
      'DOCUMENTS',
      `Génération du contrat de vente ${document.numero} pour la parcelle ${transaction.parcelle.reference}`,
    );

    return document;
  }

  async remove(id: number) {
    const document = await this.findOne(id);

    const resultat = await this.prisma.document.delete({
      where: { id },
    });

    await this.historiqueService.create(
      'SUPPRESSION',
      'DOCUMENTS',
      `Suppression du document ${document.numero}`,
    );

    return resultat;
  }
}
