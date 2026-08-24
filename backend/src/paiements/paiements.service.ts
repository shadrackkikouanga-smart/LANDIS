import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreatePaiementDto } from './dto/create-paiement.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';

import { StatutPaiement } from '@prisma/client';
import { Response } from 'express';
import PDFDocument from 'pdfkit';


@Injectable()
export class PaiementsService {

  constructor(
    private readonly prisma: PrismaService,

    private readonly historiqueService:
      HistoriqueService,
  ) {}


  async create(
    createPaiementDto: CreatePaiementDto,
  ) {

    const {
      transactionId,
      montant,
    } = createPaiementDto;


    const transaction =
      await this.prisma.transaction.findUnique({

        where: {
          id: transactionId,
        },

        include: {
          parcelle: true,
          acquereur: true,
        },

      });


    if (!transaction) {

      throw new NotFoundException(
        'Transaction introuvable',
      );

    }


    const paiementsExistants =
      await this.prisma.paiement.aggregate({

        where: {
          transactionId,
        },

        _sum: {
          montant: true,
        },

      });


    const totalDejaPaye =
      paiementsExistants._sum.montant ?? 0;


    if (transaction.prix) {

      const nouveauTotal =
        totalDejaPaye + montant;


      if (
        nouveauTotal >
        transaction.prix
      ) {

        throw new BadRequestException(
          `Le paiement dépasse le montant restant. Restant à payer : ${transaction.prix - totalDejaPaye} FCFA`,
        );

      }

    }


    /*
     * Génération automatique
     * du numéro de reçu
     */

    const dernierPaiement =
      await this.prisma.paiement.findFirst({

        orderBy: {
          id: 'desc',
        },

      });


    const prochainNumero =
      dernierPaiement
        ? dernierPaiement.id + 1
        : 1;


    const numeroRecu =
      `REC-${String(prochainNumero).padStart(6, '0')}`;


    const paiement =
      await this.prisma.paiement.create({

        data: {

          numeroRecu,

          transactionId,

          montant,

          modePaiement:
            createPaiementDto.modePaiement,

          reference:
            createPaiementDto.reference,

          commentaire:
            createPaiementDto.commentaire,

        },

      });


    await this.recalculerStatutPaiement(
      transactionId,
    );


    await this.historiqueService.create(
      'CREATION',
      'PAIEMENTS',
      `Paiement de ${montant} FCFA enregistré pour le reçu "${numeroRecu}" sur la parcelle "${transaction.parcelle.reference}"`,
    );


    return paiement;

  }


  async findAll() {

    return this.prisma.paiement.findMany({

      include: {

        transaction: true,

      },

    });

  }


  async findOne(
    id: number,
  ) {

    const paiement =
      await this.prisma.paiement.findUnique({

        where: {
          id,
        },

        include: {

          transaction: true,

        },

      });


    if (!paiement) {

      throw new NotFoundException(
        'Paiement introuvable',
      );

    }


    return paiement;

  }


  async findByTransaction(
    transactionId: number,
  ) {

    const transaction =
      await this.prisma.transaction.findUnique({

        where: {
          id: transactionId,
        },

        include: {
          acquereur: true,
        },

      });


    if (!transaction) {

      throw new NotFoundException(
        'Transaction introuvable',
      );

    }


    const paiements =
      await this.prisma.paiement.findMany({

        where: {
          transactionId,
        },

        orderBy: {
          datePaiement: 'asc',
        },

      });


    const totalPaye =
      paiements.reduce(
        (total, paiement) =>
          total + paiement.montant,
        0,
      );


    const resteAPayer =
      transaction.prix
        ? transaction.prix - totalPaye
        : 0;


    return {

      transaction: {

        id: transaction.id,

        prix: transaction.prix,

        type: transaction.type,

        statut: transaction.statut,

        statutPaiement:
          transaction.statutPaiement,

        acquereur:
          transaction.acquereur,

      },

      historiquePaiements:
        paiements,

      totalPaye,

      resteAPayer,

    };

  }


  async update(
    id: number,

    updatePaiementDto:
      UpdatePaiementDto,
  ) {

    const paiement =
      await this.findOne(id);


    const resultat =
      await this.prisma.paiement.update({

        where: {
          id,
        },

        data:
          updatePaiementDto,

      });


    await this.recalculerStatutPaiement(
      paiement.transactionId,
    );


    await this.historiqueService.create(
      'MODIFICATION',
      'PAIEMENTS',
      `Paiement "${paiement.numeroRecu}" modifié`,
    );


    return resultat;

  }


  async remove(
    id: number,
  ) {

    const paiement =
      await this.findOne(id);


    const resultat =
      await this.prisma.paiement.delete({

        where: {
          id,
        },

      });


    await this.recalculerStatutPaiement(
      paiement.transactionId,
    );


    await this.historiqueService.create(
      'SUPPRESSION',
      'PAIEMENTS',
      `Paiement "${paiement.numeroRecu}" supprimé`,
    );


    return resultat;

  }


  async getRecu(
    id: number,
  ) {

    const paiement =
      await this.prisma.paiement.findUnique({

        where: {
          id,
        },

        include: {

          transaction: {

            include: {

              acquereur: true,

              parcelle: true,

            },

          },

        },

      });


    if (!paiement) {

      throw new NotFoundException(
        'Paiement introuvable',
      );

    }


    const paiements =
      await this.prisma.paiement.findMany({

        where: {

          transactionId:
            paiement.transactionId,

        },

      });


    const totalPaye =
      paiements.reduce(
        (total, p) =>
          total + p.montant,
        0,
      );


    const resteAPayer =
      (paiement.transaction.prix ?? 0) -
      totalPaye;


    return {

      numeroRecu:
        paiement.numeroRecu,

      datePaiement:
        paiement.datePaiement,

      paiement: {

        montant:
          paiement.montant,

        modePaiement:
          paiement.modePaiement,

        reference:
          paiement.reference,

        commentaire:
          paiement.commentaire,

      },

      transaction: {

        id:
          paiement.transaction.id,

        type:
          paiement.transaction.type,

        prix:
          paiement.transaction.prix,

        statut:
          paiement.transaction.statut,

        statutPaiement:
          paiement.transaction.statutPaiement,

      },

      acquereur:
        paiement.transaction.acquereur,

      parcelle:
        paiement.transaction.parcelle,

      totalPaye,

      resteAPayer,

    };

  }


  async generatePdf(
    id: number,

    res: Response,
  ) {

    const recu =
      await this.getRecu(id);


    const doc =
      new PDFDocument({

        size: 'A4',

        margin: 50,

      });


    res.setHeader(
      'Content-Type',
      'application/pdf',
    );


    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${recu.numeroRecu}.pdf`,
    );


    doc.pipe(res);


    doc
      .fontSize(20)
      .text(
        'LANDIS',
        {
          align: 'center',
        },
      );


    doc
      .moveDown()
      .fontSize(14)
      .text(
        'RECU DE PAIEMENT',
        {
          align: 'center',
        },
      );


    doc.moveDown();


    doc.fontSize(12);


    doc.text(
      `Numéro reçu : ${recu.numeroRecu}`,
    );


    doc.text(
      `Date : ${new Date(
        recu.datePaiement,
      ).toLocaleDateString()}`,
    );


    doc.moveDown();


    doc.text('ACQUEREUR');


    doc.text(
      `${recu.acquereur.nom} ${recu.acquereur.prenom}`,
    );


    doc.text(
      `Téléphone : ${recu.acquereur.telephone}`,
    );


    doc.moveDown();


    doc.text('PARCELLE');


    doc.text(
      `Référence : ${recu.parcelle.reference}`,
    );


    doc.text(
      `Numéro : ${recu.parcelle.numero}`,
    );


    doc.text(
      `Superficie : ${recu.parcelle.superficie} m²`,
    );


    doc.moveDown();


    doc.text('PAIEMENT');


    doc.text(
      `Montant payé : ${recu.paiement.montant} FCFA`,
    );


    doc.text(
      `Mode : ${recu.paiement.modePaiement}`,
    );


    doc.text(
      `Référence : ${recu.paiement.reference ?? '-'}`,
    );


    doc.moveDown();


    doc.text(
      `Prix terrain : ${recu.transaction.prix} FCFA`,
    );


    doc.text(
      `Total payé : ${recu.totalPaye} FCFA`,
    );


    doc.text(
      `Reste à payer : ${recu.resteAPayer} FCFA`,
    );


    doc.moveDown(3);


    doc.text(
      'Signature client : __________________',
    );


    doc.moveDown(2);


    doc.text(
      'Signature LANDIS : ________________',
    );


    doc.end();

  }


  private async recalculerStatutPaiement(
    transactionId: number,
  ) {

    const transaction =
      await this.prisma.transaction.findUnique({

        where: {
          id: transactionId,
        },

      });


    if (!transaction) {

      throw new NotFoundException(
        'Transaction introuvable',
      );

    }


    const paiements =
      await this.prisma.paiement.aggregate({

        where: {

          transactionId,

        },

        _sum: {

          montant: true,

        },

      });


    const totalPaye =
      paiements._sum.montant ?? 0;


    let statutPaiement:
      StatutPaiement;


    if (!transaction.prix) {

      statutPaiement =
        StatutPaiement.PARTIEL;

    }

    else if (
      totalPaye >= transaction.prix
    ) {

      statutPaiement =
        StatutPaiement.PAYE;

    }

    else {

      statutPaiement =
        StatutPaiement.PARTIEL;

    }


    await this.prisma.transaction.update({

      where: {

        id: transactionId,

      },

      data: {

        statutPaiement,

      },

    });

  }

}