import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  SituationRecensement,
  StatutTransaction,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ComparaisonRecensementService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async comparerRecensement(recensementId: number) {
    const recensement =
      await this.prisma.recensement.findUnique({
        where: {
          id: recensementId,
        },
        include: {
          parcelle: {
            include: {
              bloc: {
                include: {
                  section: {
                    include: {
                      terrain: true,
                    },
                  },
                },
              },
            },
          },
          famille: true,
          vendeurDonateurMembre: true,
          documents: true,
          signataires: true,
          autorites: true,
        },
      });

    if (!recensement) {
      throw new NotFoundException(
        `Le recensement ${recensementId} est introuvable`,
      );
    }

    const parcelleId =
      recensement.parcelleId;

    const transactions =
      await this.prisma.transaction.findMany({
        where: {
          parcelleId,
        },
        include: {
          acquereur: true,
          paiements: true,
        },
        orderBy: {
          dateTransaction: 'desc',
        },
      });

    const transactionActive =
      transactions.find(
        (transaction) =>
          transaction.statut ===
            StatutTransaction.EN_ATTENTE ||
          transaction.statut ===
            StatutTransaction.VALIDEE,
      ) ?? null;

    const transactionsValidees =
      transactions.filter(
        (transaction) =>
          transaction.statut ===
          StatutTransaction.VALIDEE,
      );

    const anomalies: string[] = [];
    const avertissements: string[] = [];
    const observations: string[] = [];

    const statutParcelle =
      recensement.parcelle.statut;

    /*
     * --------------------------------------------------
     * COMPARAISON DE LA SITUATION DU RECENSEMENT
     * AVEC LE STATUT DE LA PARCELLE DANS LANDIS
     * --------------------------------------------------
     */

    /*
     * --------------------------------------------------
     * CAS : VENDUE
     * --------------------------------------------------
     */

    if (
      recensement.situation ===
      SituationRecensement.VENDUE
    ) {
      /*
       * Une vente constatée sur le terrain alors que
       * LANDIS considère encore la parcelle disponible
       * constitue un écart à vérifier, et non une
       * anomalie automatique.
       */
      if (statutParcelle === 'DISPONIBLE') {
        avertissements.push(
          'La parcelle est déclarée vendue lors du recensement mais reste DISPONIBLE dans LANDIS.',
        );
      }

      /*
       * Si LANDIS indique déjà VENDUE, on constate
       * simplement la cohérence du statut.
       */
      if (statutParcelle === 'VENDUE') {
        observations.push(
          'La parcelle est déclarée vendue et son statut LANDIS est également VENDUE.',
        );
      }

      /*
       * Une vente recensée sans transaction LANDIS
       * est un élément à vérifier, mais pas une
       * anomalie automatique.
       */
      if (!transactionActive) {
        avertissements.push(
          'Une vente est déclarée lors du recensement mais aucune transaction active correspondante n’est enregistrée dans LANDIS.',
        );
      }

      if (transactionActive) {
        observations.push(
          `Une transaction active existe dans LANDIS pour la parcelle ${recensement.parcelle.reference}.`,
        );
      }

      if (
        transactionActive &&
        recensement.vendeurDonateurMembreId
      ) {
        observations.push(
          `Le recensement identifie ${recensement.vendeurDonateurMembre?.prenom ?? ''} ${recensement.vendeurDonateurMembre?.nom ?? ''} comme vendeur ou représentant de la famille foncière.`,
        );
      }
    }

    /*
     * --------------------------------------------------
     * CAS : DONNEE
     * --------------------------------------------------
     */

    if (
      recensement.situation ===
      SituationRecensement.DONNEE
    ) {
      /*
       * Une donation constatée alors que LANDIS
       * considère encore la parcelle disponible
       * constitue un écart à vérifier.
       */
      if (statutParcelle === 'DISPONIBLE') {
        avertissements.push(
          'La parcelle est déclarée donnée lors du recensement mais reste DISPONIBLE dans LANDIS.',
        );
      }

      /*
       * Donation constatée alors que LANDIS considère
       * la parcelle comme vendue : contradiction forte.
       */
      if (statutParcelle === 'VENDUE') {
        anomalies.push(
          'La parcelle est déclarée donnée lors du recensement alors que LANDIS indique qu’elle est VENDUE.',
        );
      }

      /*
       * Une transaction active sur une parcelle déclarée
       * donnée constitue une contradiction à examiner.
       */
      if (transactionActive) {
        anomalies.push(
          'Une transaction active existe dans LANDIS alors que le recensement indique une donation.',
        );
      } else {
        observations.push(
          'Aucune transaction active n’est enregistrée dans LANDIS pour cette parcelle donnée.',
        );
      }

      if (recensement.vendeurDonateurMembreId) {
        observations.push(
          `Le recensement identifie ${recensement.vendeurDonateurMembre?.prenom ?? ''} ${recensement.vendeurDonateurMembre?.nom ?? ''} comme donateur.`,
        );
      }
    }

    /*
     * --------------------------------------------------
     * CAS : PRISE ANARCHIQUEMENT
     * --------------------------------------------------
     */

    if (
      recensement.situation ===
      SituationRecensement.PRISE_ANARCHIQUEMENT
    ) {
      /*
       * Une transaction active contredit directement
       * une situation déclarée comme prise anarchique.
       */
      if (transactionActive) {
        anomalies.push(
          'Une transaction active existe dans LANDIS alors que le recensement constate une prise anarchique.',
        );
      }

      /*
       * LANDIS considère la parcelle comme vendue alors
       * que le recensement constate une prise anarchique.
       */
      if (statutParcelle === 'VENDUE') {
        anomalies.push(
          'La parcelle est déjà indiquée VENDUE dans LANDIS alors que le recensement constate une prise anarchique.',
        );
      }

      /*
       * Une parcelle disponible avec une occupation
       * anarchique est une situation à examiner,
       * mais pas automatiquement une anomalie juridique.
       */
      if (
        !transactionActive &&
        statutParcelle === 'DISPONIBLE'
      ) {
        avertissements.push(
          'La parcelle est occupée selon le recensement alors qu’elle reste DISPONIBLE dans LANDIS.',
        );
      }

      if (!recensement.cooperative) {
        avertissements.push(
          'L’occupant est déclaré non coopératif lors du recensement.',
        );
      }

      if (!recensement.documents.length) {
        observations.push(
          'Aucun document n’a été enregistré dans le recensement pour cette occupation.',
        );
      }
    }

    /*
     * --------------------------------------------------
     * CAS : A VERIFIER
     * --------------------------------------------------
     */

    if (
      recensement.situation ===
      SituationRecensement.A_VERIFIER
    ) {
      avertissements.push(
        'La situation de cette parcelle a été classée À VÉRIFIER lors du recensement.',
      );
    }

    /*
     * --------------------------------------------------
     * COMPARAISON DES DONNÉES COMMERCIALES
     * --------------------------------------------------
     */

    let comparaisonTransaction:
      | {
          existe: boolean;
          transactionId: number | null;
          statut: StatutTransaction | null;
          type: string | null;
          acquereur: {
            id: number;
            nom: string;
            prenom: string;
            telephone: string;
          } | null;
          prix: number | null;
          totalPaye: number;
          resteAPayer: number;
        }
      | null = null;

    if (transactionActive) {
      const totalPaye =
        transactionActive.paiements.reduce(
          (total, paiement) =>
            total + paiement.montant,
          0,
        );

      const prix =
        transactionActive.prix !== null
          ? Number(transactionActive.prix)
          : null;

      const resteAPayer =
        prix !== null
          ? Math.max(prix - totalPaye, 0)
          : 0;

      comparaisonTransaction = {
        existe: true,
        transactionId:
          transactionActive.id,
        statut:
          transactionActive.statut,
        type:
          transactionActive.type,
        acquereur:
          transactionActive.acquereur,
        prix,
        totalPaye,
        resteAPayer,
      };

      /*
       * Le montant différent entre le recensement
       * et LANDIS constitue une vraie anomalie
       * de données commerciales.
       */
      if (
        recensement.situation ===
          SituationRecensement.VENDUE &&
        recensement.montantTotal !== null &&
        prix !== null &&
        Number(recensement.montantTotal) !==
          prix
      ) {
        anomalies.push(
          `Le montant déclaré lors du recensement (${Number(recensement.montantTotal)} FCFA) est différent du prix enregistré dans LANDIS (${prix} FCFA).`,
        );
      }

      /*
       * Même principe pour les paiements.
       */
      if (
        recensement.situation ===
          SituationRecensement.VENDUE &&
        recensement.montantPaye !== null &&
        totalPaye !==
          Number(recensement.montantPaye)
      ) {
        anomalies.push(
          `Le montant payé déclaré lors du recensement (${Number(recensement.montantPaye)} FCFA) est différent du montant des paiements enregistrés dans LANDIS (${totalPaye} FCFA).`,
        );
      }
    } else {
      comparaisonTransaction = {
        existe: false,
        transactionId: null,
        statut: null,
        type: null,
        acquereur: null,
        prix: null,
        totalPaye: 0,
        resteAPayer: 0,
      };
    }

    /*
     * --------------------------------------------------
     * NIVEAU GLOBAL DE COHÉRENCE
     * --------------------------------------------------
     */

    let niveau:
      | 'COHERENT'
      | 'A_VERIFIER'
      | 'ANOMALIE';

    if (anomalies.length > 0) {
      niveau = 'ANOMALIE';
    } else if (avertissements.length > 0) {
      niveau = 'A_VERIFIER';
    } else {
      niveau = 'COHERENT';
    }

    /*
     * --------------------------------------------------
     * RÉSULTAT
     * --------------------------------------------------
     */

    return {
      recensement: {
        id: recensement.id,
        situation: recensement.situation,
        cooperative: recensement.cooperative,

        occupant: {
          nom: recensement.occupantNom,
          prenom: recensement.occupantPrenom,
          telephone:
            recensement.occupantTelephone,
          adresse:
            recensement.occupantAdresse,
        },

        famille: recensement.famille
          ? {
              id: recensement.famille.id,
              nom: recensement.famille.nom,
              estPrincipale:
                recensement.famille.estPrincipale,
            }
          : null,

        vendeurDonateur:
          recensement.vendeurDonateurMembre
            ? {
                id:
                  recensement
                    .vendeurDonateurMembre.id,

                nom:
                  recensement
                    .vendeurDonateurMembre.nom,

                prenom:
                  recensement
                    .vendeurDonateurMembre
                    .prenom,

                qualite:
                  recensement
                    .vendeurDonateurQualite,
              }
            : recensement.vendeurDonateurNom
              ? {
                  id: null,

                  nom:
                    recensement
                      .vendeurDonateurNom,

                  prenom:
                    recensement
                      .vendeurDonateurPrenom,

                  qualite:
                    recensement
                      .vendeurDonateurQualite,
                }
              : null,

        montantTotal:
          recensement.montantTotal !== null
            ? Number(recensement.montantTotal)
            : null,

        montantPaye:
          recensement.montantPaye !== null
            ? Number(recensement.montantPaye)
            : null,
      },

      landis: {
        parcelle: {
          id: recensement.parcelle.id,

          reference:
            recensement.parcelle.reference,

          numero:
            recensement.parcelle.numero,

          superficie:
            recensement.parcelle.superficie,

          statut: statutParcelle,

          proprietaire:
            recensement.parcelle.proprietaireId,
        },

        transactions: {
          nombre: transactions.length,

          nombreValidees:
            transactionsValidees.length,

          transactionActive:
            comparaisonTransaction,
        },
      },

      comparaison: {
        niveau,

        anomalies,

        avertissements,

        observations,
      },

      documents: {
        nombre:
          recensement.documents.length,

        documents:
          recensement.documents,
      },

      signataires: {
        nombre:
          recensement.signataires.length,

        signataires:
          recensement.signataires,
      },

      autorites: {
        nombre:
          recensement.autorites.length,

        autorites:
          recensement.autorites,
      },
    };
  }

  async comparerParcelle(parcelleId: number) {
    const dernierRecensement =
      await this.prisma.recensement.findFirst({
        where: {
          parcelleId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    if (!dernierRecensement) {
      throw new NotFoundException(
        `Aucun recensement trouvé pour la parcelle ${parcelleId}`,
      );
    }

    return this.comparerRecensement(
      dernierRecensement.id,
    );
  }

  async comparerTous() {
    const recensements =
      await this.prisma.recensement.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
        },
      });

    const resultats: Awaited<
      ReturnType<
        ComparaisonRecensementService['comparerRecensement']
      >
    >[] = [];

    for (const recensement of recensements) {
      const resultat =
        await this.comparerRecensement(
          recensement.id,
        );

      resultats.push(resultat);
    }

    return resultats;
  }
}