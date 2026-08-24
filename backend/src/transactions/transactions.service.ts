import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';


@Injectable()
export class TransactionsService {

  constructor(
    private prisma: PrismaService,

    private historiqueService: HistoriqueService,
  ) {}


  async create(
    createTransactionDto: CreateTransactionDto,
  ) {

    const parcelle =
      await this.prisma.parcelle.findUnique({

        where: {
          id: createTransactionDto.parcelleId,
        },

      });


    if (!parcelle) {

      throw new NotFoundException(
        'Parcelle introuvable',
      );

    }


    const acquereur =
      await this.prisma.acquereur.findUnique({

        where: {
          id: createTransactionDto.acquereurId,
        },

      });


    if (!acquereur) {

      throw new NotFoundException(
        'Acquéreur introuvable',
      );

    }


    const transactionExistante =
      await this.prisma.transaction.findFirst({

        where: {

          parcelleId:
            createTransactionDto.parcelleId,

          statut: {

            in: [
              'EN_ATTENTE',
              'VALIDEE',
            ],

          },

        },

      });


    if (transactionExistante) {

      throw new BadRequestException(
        'Cette parcelle possède déjà une transaction active',
      );

    }


    const transaction =
      await this.prisma.transaction.create({

        data:
          createTransactionDto,

        include: {

          parcelle: true,

          acquereur: true,

        },

      });


    await this.historiqueService.create(
      'CREATION',
      'TRANSACTIONS',
      `Transaction créée pour la parcelle "${parcelle.reference}" avec l'acquéreur "${acquereur.nom} ${acquereur.prenom}"`,
    );


    return transaction;

  }


  async findAll() {

    const transactions =
      await this.prisma.transaction.findMany({

        include: {

          parcelle: true,

          acquereur: true,

          paiements: true,

        },

      });


    return transactions.map(
      (transaction) => {

        const totalPaye =
          transaction.paiements.reduce(
            (total, paiement) =>
              total + paiement.montant,
            0,
          );


        const resteAPayer =
          transaction.prix
            ? transaction.prix - totalPaye
            : 0;


        return {

          ...transaction,

          totalPaye,

          resteAPayer,

        };

      },
    );

  }


  async findOne(
    id: number,
  ) {

    const transaction =
      await this.prisma.transaction.findUnique({

        where: {
          id,
        },

        include: {

          parcelle: true,

          acquereur: true,

          paiements: true,

        },

      });


    if (!transaction) {

      throw new NotFoundException(
        'Transaction introuvable',
      );

    }


    const totalPaye =
      transaction.paiements.reduce(
        (total, paiement) =>
          total + paiement.montant,
        0,
      );


    const resteAPayer =
      transaction.prix
        ? transaction.prix - totalPaye
        : 0;


    return {

      ...transaction,

      totalPaye,

      resteAPayer,

    };

  }


  async update(
    id: number,

    updateTransactionDto:
      UpdateTransactionDto,
  ) {

    const transaction =
      await this.prisma.transaction.findUnique({

        where: {
          id,
        },

        include: {

          paiements: true,

          parcelle: true,

          acquereur: true,

        },

      });


    if (!transaction) {

      throw new NotFoundException(
        'Transaction introuvable',
      );

    }


    /*
     * Vérification avant validation commerciale
     */

    if (
      updateTransactionDto.statut ===
      'VALIDEE'
    ) {

      const totalPaye =
        transaction.paiements.reduce(
          (total, paiement) =>
            total + paiement.montant,
          0,
        );


      const resteAPayer =
        transaction.prix
          ? transaction.prix - totalPaye
          : 0;


      if (resteAPayer > 0) {

        throw new BadRequestException(
          `Impossible de valider cette vente. Reste à payer : ${resteAPayer} FCFA`,
        );

      }

    }


    const resultat =
      await this.prisma.transaction.update({

        where: {
          id,
        },

        data:
          updateTransactionDto,

      });


    /*
     * Si vente validée
     */

    if (
      updateTransactionDto.statut ===
      'VALIDEE'
    ) {

      await this.prisma.parcelle.update({

        where: {

          id:
            transaction.parcelleId,

        },

        data: {

          statut: 'VENDUE',

        },

      });


      await this.historiqueService.create(
        'VALIDATION',
        'TRANSACTIONS',
        `Transaction de la parcelle "${transaction.parcelle.reference}" validée`,
      );

    }


    /*
     * Si transaction annulée
     */

    else if (
      updateTransactionDto.statut ===
      'ANNULEE'
    ) {

      await this.prisma.parcelle.update({

        where: {

          id:
            transaction.parcelleId,

        },

        data: {

          statut: 'DISPONIBLE',

        },

      });


      await this.historiqueService.create(
        'ANNULATION',
        'TRANSACTIONS',
        `Transaction de la parcelle "${transaction.parcelle.reference}" annulée`,
      );

    }


    /*
     * Autre modification
     */

    else {

      await this.historiqueService.create(
        'MODIFICATION',
        'TRANSACTIONS',
        `Transaction de la parcelle "${transaction.parcelle.reference}" modifiée`,
      );

    }


    return resultat;

  }


  async remove(
    id: number,
  ) {

    const transaction =
      await this.prisma.transaction.findUnique({

        where: {
          id,
        },

        include: {

          parcelle: true,

        },

      });


    if (!transaction) {

      throw new NotFoundException(
        'Transaction introuvable',
      );

    }


    const transactionSupprimee =
      await this.prisma.transaction.delete({

        where: {

          id,

        },

      });


    await this.historiqueService.create(
      'SUPPRESSION',
      'TRANSACTIONS',
      `Transaction de la parcelle "${transaction.parcelle.reference}" supprimée`,
    );


    return transactionSupprimee;

  }

}