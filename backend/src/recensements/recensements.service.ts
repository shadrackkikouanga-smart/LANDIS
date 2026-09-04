import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, SituationRecensement } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateRecensementDto } from './dto/create-recensement.dto';
import { UpdateRecensementDto } from './dto/update-recensement.dto';

@Injectable()
export class RecensementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Vérifie qu'une parcelle existe et récupère son terrain.
   *
   * Hiérarchie :
   * Parcelle → Bloc → Section → Terrain
   */
  private async getParcelleAvecTerrain(parcelleId: number) {
    const parcelle = await this.prisma.parcelle.findUnique({
      where: { id: parcelleId },
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
    });

    if (!parcelle) {
      throw new NotFoundException(
        `La parcelle ${parcelleId} est introuvable`,
      );
    }

    return parcelle;
  }

  /**
   * Vérifie qu'une famille appartient bien au terrain de la parcelle.
   */
  private async verifierFamillePourParcelle(
    familleId: number,
    parcelleId: number,
  ) {
    const parcelle = await this.getParcelleAvecTerrain(parcelleId);

    const famille = await this.prisma.familleFonciere.findUnique({
      where: { id: familleId },
      include: {
        terrain: true,
      },
    });

    if (!famille) {
      throw new NotFoundException(
        `La famille foncière ${familleId} est introuvable`,
      );
    }

    const terrainId = parcelle.bloc.section.terrain.id;

    if (famille.terrainId !== terrainId) {
      throw new BadRequestException(
        `La famille foncière "${famille.nom}" n'appartient pas au terrain de la parcelle`,
      );
    }

    if (!famille.active) {
      throw new BadRequestException(
        `La famille foncière "${famille.nom}" est inactive`,
      );
    }

    return {
      famille,
      parcelle,
      terrain: parcelle.bloc.section.terrain,
    };
  }

  /**
   * Vérifie le membre vendeur/donateur et son droit.
   */
  private async verifierVendeurDonateur(
    membreId: number,
    familleId: number,
    situation: SituationRecensement,
  ) {
    const membre =
      await this.prisma.membreFamilleFonciere.findUnique({
        where: { id: membreId },
        include: {
          famille: true,
          droits: {
            where: {
              actif: true,
            },
          },
        },
      });

    if (!membre) {
      throw new NotFoundException(
        `Le membre de famille ${membreId} est introuvable`,
      );
    }

    if (membre.familleId !== familleId) {
      throw new BadRequestException(
        `Le membre sélectionné n'appartient pas à la famille foncière indiquée`,
      );
    }

    if (situation === SituationRecensement.VENDUE) {
      const droitVendre = membre.droits.some(
        (droit) =>
          droit.type === 'VENDRE' ||
          droit.type === 'AUTRE',
      );

      if (!droitVendre) {
        throw new BadRequestException(
          `Le membre ${membre.prenom} ${membre.nom} ne possède pas de droit actif de vente`,
        );
      }
    }

    if (situation === SituationRecensement.DONNEE) {
      const droitDonner = membre.droits.some(
        (droit) =>
          droit.type === 'DONNER' ||
          droit.type === 'AUTRE',
      );

      if (!droitDonner) {
        throw new BadRequestException(
          `Le membre ${membre.prenom} ${membre.nom} ne possède pas de droit actif de donation`,
        );
      }
    }

    return membre;
  }

  /**
   * Vérifie la cohérence des informations financières.
   */
  private verifierMontants(
    montantTotal?: number,
    montantPaye?: number,
  ) {
    if (
      montantTotal !== undefined &&
      montantPaye !== undefined &&
      montantPaye > montantTotal
    ) {
      throw new BadRequestException(
        'Le montant payé ne peut pas être supérieur au montant total',
      );
    }
  }

  /**
   * Vérifie les règles métier avant création ou modification.
   */
  private async verifierReglesMetier(
    dto: CreateRecensementDto | UpdateRecensementDto,
    parcelleId: number,
  ) {
    const situation = dto.situation;

    this.verifierMontants(
      dto.montantTotal,
      dto.montantPaye,
    );

    const situationsAvecFamille: SituationRecensement[] = [
      SituationRecensement.VENDUE,
      SituationRecensement.DONNEE,
    ];

    if (
      situation &&
      situationsAvecFamille.includes(situation) &&
      !dto.familleId
    ) {
      throw new BadRequestException(
        `Une famille foncière doit être indiquée pour une parcelle ${
          situation === SituationRecensement.VENDUE
            ? 'vendue'
            : 'donnée'
        }`,
      );
    }

    if (
      situation &&
      situationsAvecFamille.includes(situation) &&
      !dto.vendeurDonateurMembreId
    ) {
      throw new BadRequestException(
        `Le vendeur ou donateur doit être indiqué pour une parcelle ${
          situation === SituationRecensement.VENDUE
            ? 'vendue'
            : 'donnée'
        }`,
      );
    }

    if (dto.familleId !== undefined) {
      await this.verifierFamillePourParcelle(
        dto.familleId,
        parcelleId,
      );
    }

    if (
      dto.vendeurDonateurMembreId !== undefined &&
      dto.familleId !== undefined &&
      situation
    ) {
      await this.verifierVendeurDonateur(
        dto.vendeurDonateurMembreId,
        dto.familleId,
        situation,
      );
    }
  }

  /**
   * Prépare les documents pour Prisma.
   */
  private prepareDocuments(
    documents: CreateRecensementDto['documents'],
  ) {
    if (!documents) {
      return undefined;
    }

    return documents.map((document) => ({
      typeDocument: document.typeDocument,
      reference: document.reference,
      dateDocument: document.dateDocument
        ? new Date(document.dateDocument)
        : undefined,
      observations: document.observations,
    }));
  }

  /**
   * Prépare les signataires pour Prisma.
   */
  private prepareSignataires(
    signataires: CreateRecensementDto['signataires'],
  ) {
    if (!signataires) {
      return undefined;
    }

    return signataires.map((signataire) => ({
      nom: signataire.nom,
      prenom: signataire.prenom,
      qualite: signataire.qualite,
      fonction: signataire.fonction,
      observations: signataire.observations,
    }));
  }

  /**
   * Prépare les autorités de l'État pour Prisma.
   */
  private prepareAutorites(
    autorites: CreateRecensementDto['autorites'],
  ) {
    if (!autorites) {
      return undefined;
    }

    return autorites.map((autorite) => ({
      nom: autorite.nom,
      prenom: autorite.prenom,
      fonction: autorite.fonction,
      institution: autorite.institution,
      telephone: autorite.telephone,
      observations: autorite.observations,
    }));
  }

  /**
   * Création d'un recensement.
   *
   * IMPORTANT :
   * La création d'un recensement ne modifie PAS
   * automatiquement le statut de la parcelle.
   */
  async create(dto: CreateRecensementDto) {
    const parcelle = await this.getParcelleAvecTerrain(
      dto.parcelleId,
    );

    await this.verifierReglesMetier(
      dto,
      dto.parcelleId,
    );

    const recensement = await this.prisma.$transaction(
      async (tx) => {
        const nouveauRecensement =
          await tx.recensement.create({
            data: {
              parcelleId: dto.parcelleId,
              situation: dto.situation,

              occupantNom: dto.occupantNom,
              occupantPrenom: dto.occupantPrenom,
              occupantTelephone: dto.occupantTelephone,
              occupantAdresse: dto.occupantAdresse,

              familleId: dto.familleId,

              vendeurDonateurNom:
                dto.vendeurDonateurNom,
              vendeurDonateurPrenom:
                dto.vendeurDonateurPrenom,
              vendeurDonateurMembreId:
                dto.vendeurDonateurMembreId,
              vendeurDonateurQualite:
                dto.vendeurDonateurQualite,

              montantTotal:
                dto.montantTotal !== undefined
                  ? new Prisma.Decimal(
                      dto.montantTotal,
                    )
                  : undefined,

              montantPaye:
                dto.montantPaye !== undefined
                  ? new Prisma.Decimal(
                      dto.montantPaye,
                    )
                  : undefined,

              droitRevendique:
                dto.droitRevendique,

              cooperative:
                dto.cooperative ?? true,

              observations:
                dto.observations,

              documents: dto.documents
                ? {
                    create:
                      this.prepareDocuments(
                        dto.documents,
                      ),
                  }
                : undefined,

              signataires: dto.signataires
                ? {
                    create:
                      this.prepareSignataires(
                        dto.signataires,
                      ),
                  }
                : undefined,

              autorites: dto.autorites
                ? {
                    create:
                      this.prepareAutorites(
                        dto.autorites,
                      ),
                  }
                : undefined,
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

        await tx.historique.create({
          data: {
            action: 'CREATION',
            module: 'RECENSEMENT',
            description: `Recensement créé pour la parcelle ${parcelle.reference} - situation : ${dto.situation}`,
          },
        });

        return nouveauRecensement;
      },
    );

    return recensement;
  }

  /**
   * Liste tous les recensements.
   */
  async findAll() {
    return this.prisma.recensement.findMany({
      orderBy: {
        createdAt: 'desc',
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
  }

  /**
   * Liste les recensements d'une parcelle.
   */
  async findByParcelle(parcelleId: number) {
    await this.getParcelleAvecTerrain(parcelleId);

    return this.prisma.recensement.findMany({
      where: {
        parcelleId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        famille: true,
        vendeurDonateurMembre: true,
        documents: true,
        signataires: true,
        autorites: true,
      },
    });
  }

  /**
   * Récupère un recensement.
   */
  async findOne(id: number) {
    const recensement =
      await this.prisma.recensement.findUnique({
        where: { id },
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
          famille: {
            include: {
              membres: true,
              droits: true,
            },
          },
          vendeurDonateurMembre: {
            include: {
              famille: true,
              droits: true,
            },
          },
          documents: true,
          signataires: true,
          autorites: true,
        },
      });

    if (!recensement) {
      throw new NotFoundException(
        `Le recensement ${id} est introuvable`,
      );
    }

    return recensement;
  }

  /**
   * Modification d'un recensement.
   *
   * Les tableaux documents/signataires/autorités
   * sont remplacés uniquement lorsqu'ils sont fournis.
   *
   * Les informations spécifiques à l'ancienne situation
   * sont nettoyées lorsqu'elles ne sont plus pertinentes.
   */
  async update(
    id: number,
    dto: UpdateRecensementDto,
  ) {
    const existant = await this.findOne(id);

    const parcelleId =
      dto.parcelleId ?? existant.parcelleId;

    const situation =
      dto.situation ?? existant.situation;

    /*
     * La famille peut rester pertinente dans plusieurs
     * situations de recensement. Lorsqu'elle n'est pas
     * fournie, on conserve donc celle déjà enregistrée.
     */
    const familleId =
      dto.familleId !== undefined
        ? dto.familleId
        : existant.familleId ?? undefined;

    /*
     * Un vendeur/donateur n'est pertinent que pour
     * VENDUE ou DONNEE.
     *
     * Si la situation change vers une autre catégorie,
     * les anciennes informations vendeur/donateur
     * doivent être supprimées.
     */
    const situationAvecVendeurDonateur =
      situation === SituationRecensement.VENDUE ||
      situation === SituationRecensement.DONNEE;

    const vendeurDonateurMembreId =
      situationAvecVendeurDonateur
        ? dto.vendeurDonateurMembreId !== undefined
          ? dto.vendeurDonateurMembreId
          : existant.vendeurDonateurMembreId ??
            undefined
        : undefined;

    const montantTotal =
      situation === SituationRecensement.VENDUE
        ? dto.montantTotal !== undefined
          ? dto.montantTotal
          : existant.montantTotal !== null
            ? Number(existant.montantTotal)
            : undefined
        : undefined;

    const montantPaye =
      situation === SituationRecensement.VENDUE
        ? dto.montantPaye !== undefined
          ? dto.montantPaye
          : existant.montantPaye !== null
            ? Number(existant.montantPaye)
            : undefined
        : undefined;

    /*
     * Les informations texte du vendeur/donateur suivent
     * la même règle que son identifiant.
     */
    const vendeurDonateurNom =
      situationAvecVendeurDonateur
        ? dto.vendeurDonateurNom !== undefined
          ? dto.vendeurDonateurNom
          : existant.vendeurDonateurNom
        : null;

    const vendeurDonateurPrenom =
      situationAvecVendeurDonateur
        ? dto.vendeurDonateurPrenom !== undefined
          ? dto.vendeurDonateurPrenom
          : existant.vendeurDonateurPrenom
        : null;

    const vendeurDonateurQualite =
      situationAvecVendeurDonateur
        ? dto.vendeurDonateurQualite !== undefined
          ? dto.vendeurDonateurQualite
          : existant.vendeurDonateurQualite
        : null;

    const dtoPourValidation: CreateRecensementDto = {
      parcelleId,
      situation,
      familleId,
      vendeurDonateurMembreId,
      montantTotal,
      montantPaye,
    };

    await this.verifierReglesMetier(
      dtoPourValidation,
      parcelleId,
    );

    const documents =
      dto.documents !== undefined
        ? this.prepareDocuments(dto.documents)
        : undefined;

    const signataires =
      dto.signataires !== undefined
        ? this.prepareSignataires(
            dto.signataires,
          )
        : undefined;

    const autorites =
      dto.autorites !== undefined
        ? this.prepareAutorites(dto.autorites)
        : undefined;

    const recensement =
      await this.prisma.$transaction(async (tx) => {
        if (dto.documents !== undefined) {
          await tx.recensementDocument.deleteMany({
            where: {
              recensementId: id,
            },
          });
        }

        if (dto.signataires !== undefined) {
          await tx.recensementSignataire.deleteMany({
            where: {
              recensementId: id,
            },
          });
        }

        if (dto.autorites !== undefined) {
          await tx.recensementAutoriteEtat.deleteMany({
            where: {
              recensementId: id,
            },
          });
        }

        const updated =
          await tx.recensement.update({
            where: { id },

            data: {
              parcelleId,

              situation,

              occupantNom:
                dto.occupantNom !== undefined
                  ? dto.occupantNom
                  : existant.occupantNom,

              occupantPrenom:
                dto.occupantPrenom !== undefined
                  ? dto.occupantPrenom
                  : existant.occupantPrenom,

              occupantTelephone:
                dto.occupantTelephone !== undefined
                  ? dto.occupantTelephone
                  : existant.occupantTelephone,

              occupantAdresse:
                dto.occupantAdresse !== undefined
                  ? dto.occupantAdresse
                  : existant.occupantAdresse,

              familleId,

              vendeurDonateurNom,
              vendeurDonateurPrenom,
              vendeurDonateurMembreId,
              vendeurDonateurQualite,

              montantTotal:
                montantTotal !== undefined
                  ? new Prisma.Decimal(
                      montantTotal,
                    )
                  : null,

              montantPaye:
                montantPaye !== undefined
                  ? new Prisma.Decimal(
                      montantPaye,
                    )
                  : null,

              droitRevendique:
                dto.droitRevendique !== undefined
                  ? dto.droitRevendique
                  : existant.droitRevendique,

              cooperative:
                dto.cooperative !== undefined
                  ? dto.cooperative
                  : existant.cooperative,

              observations:
                dto.observations !== undefined
                  ? dto.observations
                  : existant.observations,

              documents:
                documents !== undefined
                  ? {
                      create: documents,
                    }
                  : undefined,

              signataires:
                signataires !== undefined
                  ? {
                      create: signataires,
                    }
                  : undefined,

              autorites:
                autorites !== undefined
                  ? {
                      create: autorites,
                    }
                  : undefined,
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

        await tx.historique.create({
          data: {
            action: 'MODIFICATION',
            module: 'RECENSEMENT',
            description: `Recensement ${id} modifié pour la parcelle ${updated.parcelle.reference}`,
          },
        });

        return updated;
      });

    return recensement;
  }

  /**
   * Suppression d'un recensement.
   *
   * Les documents, signataires et autorités associés
   * sont supprimés grâce à onDelete: Cascade.
   */
  async remove(id: number) {
    const existant = await this.findOne(id);

    await this.prisma.$transaction(
      async (tx) => {
        await tx.recensement.delete({
          where: { id },
        });

        await tx.historique.create({
          data: {
            action: 'SUPPRESSION',
            module: 'RECENSEMENT',
            description: `Recensement ${id} supprimé pour la parcelle ${existant.parcelle.reference}`,
          },
        });
      },
    );

    return {
      message: 'Recensement supprimé avec succès',
      id,
    };
  }
}