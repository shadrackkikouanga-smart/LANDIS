import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateParcelleDto } from './dto/create-parcelle.dto';
import { UpdateParcelleDto } from './dto/update-parcelle.dto';

@Injectable()
export class ParcellesService {
  constructor(
    private prisma: PrismaService,
    private historiqueService: HistoriqueService,
  ) {}

  // ============================================================
  // CREATION D'UNE PARCELLE
  // ============================================================

  async create(
    createParcelleDto: CreateParcelleDto,
  ) {
    const parcelle =
      await this.prisma.parcelle.create({
        data: createParcelleDto,
      });

    await this.historiqueService.create(
      'CREATION',
      'PARCELLES',
      `Parcelle "${parcelle.reference}" créée`,
    );

    return parcelle;
  }

  // ============================================================
  // LISTE DES PARCELLES AVEC PAGINATION
  // ============================================================

  async findAll(
    page = 1,
    limit = 20,
  ) {
    if (
      !Number.isInteger(page) ||
      page < 1
    ) {
      throw new BadRequestException(
        'Le numéro de page doit être un entier supérieur ou égal à 1.',
      );
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1
    ) {
      throw new BadRequestException(
        'La limite doit être un entier supérieur ou égal à 1.',
      );
    }

    const total =
      await this.prisma.parcelle.count();

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(total / limit);

    if (
      totalPages > 0 &&
      page > totalPages
    ) {
      throw new BadRequestException(
        `La page ${page} n'existe pas. La dernière page est la page ${totalPages}.`,
      );
    }

    const skip =
      (page - 1) * limit;

    const data =
      await this.prisma.parcelle.findMany({
        skip,
        take: limit,

        orderBy: {
          id: 'asc',
        },

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

          proprietaire: true,
        },
      });

    return {
      data,

      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // ============================================================
  // DETAIL D'UNE PARCELLE
  // ============================================================

  async findOne(
    id: number,
  ) {
    const parcelle =
      await this.prisma.parcelle.findUnique({
        where: {
          id,
        },

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

          proprietaire: true,
        },
      });

    if (!parcelle) {
      throw new NotFoundException(
        'Parcelle introuvable',
      );
    }

    return parcelle;
  }

  // ============================================================
  // MODIFICATION D'UNE PARCELLE
  // ============================================================

  async update(
    id: number,
    updateParcelleDto: UpdateParcelleDto,
  ) {
    const parcelle =
      await this.findOne(id);

    const ancienneSuperficie =
      parcelle.superficie;

    const nouvelleSuperficie =
      updateParcelleDto.superficie ??
      ancienneSuperficie;

    const superficieModifiee =
      nouvelleSuperficie !==
      ancienneSuperficie;

    const ancienBlocId =
      parcelle.blocId;

    const nouveauBlocId =
      updateParcelleDto.blocId ??
      ancienBlocId;

    if (
      ancienBlocId === nouveauBlocId
    ) {
      if (!superficieModifiee) {
        const parcelleModifiee =
          await this.prisma.parcelle.update({
            where: {
              id,
            },

            data: updateParcelleDto,

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

              proprietaire: true,
            },
          });

        await this.historiqueService.create(
          'MODIFICATION',
          'PARCELLES',
          `Parcelle "${parcelle.reference}" modifiée`,
        );

        return parcelleModifiee;
      }

      const difference =
        nouvelleSuperficie -
        ancienneSuperficie;

      const bloc =
        await this.prisma.bloc.findUnique({
          where: {
            id: ancienBlocId,
          },

          include: {
            section: {
              include: {
                terrain: true,
              },
            },
          },
        });

      if (!bloc) {
        throw new NotFoundException(
          'Bloc introuvable',
        );
      }

      const nouvelleSuperficieBloc =
        bloc.superficie +
        difference;

      if (
        nouvelleSuperficieBloc <= 0
      ) {
        throw new BadRequestException(
          'La superficie du bloc doit être supérieure à 0 m².',
        );
      }

      if (
        nouvelleSuperficieBloc >
        bloc.section.terrain.superficie
      ) {
        throw new BadRequestException(
          `Impossible de modifier la superficie de la parcelle. ` +
            `La nouvelle superficie du bloc "${bloc.reference}" ` +
            `serait de ${nouvelleSuperficieBloc.toFixed(2)} m², ` +
            `alors que le terrain possède seulement ` +
            `${bloc.section.terrain.superficie.toFixed(2)} m².`,
        );
      }

      const resultat =
        await this.prisma.$transaction(
          async (tx) => {
            const parcelleModifiee =
              await tx.parcelle.update({
                where: {
                  id,
                },

                data: updateParcelleDto,

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

                  proprietaire: true,
                },
              });

            await tx.bloc.update({
              where: {
                id: ancienBlocId,
              },

              data: {
                superficie:
                  nouvelleSuperficieBloc,
              },
            });

            return parcelleModifiee;
          },
        );

      await this.historiqueService.create(
        'MODIFICATION',
        'PARCELLES',
        `Superficie de la parcelle "${parcelle.reference}" modifiée de ${ancienneSuperficie.toFixed(2)} m² à ${nouvelleSuperficie.toFixed(2)} m². Superficie du bloc "${bloc.reference}" ajustée automatiquement à ${nouvelleSuperficieBloc.toFixed(2)} m².`,
      );

      return resultat;
    }

    const ancienBloc =
      await this.prisma.bloc.findUnique({
        where: {
          id: ancienBlocId,
        },

        include: {
          section: {
            include: {
              terrain: true,
            },
          },
        },
      });

    if (!ancienBloc) {
      throw new NotFoundException(
        'Ancien bloc introuvable',
      );
    }

    const nouveauBloc =
      await this.prisma.bloc.findUnique({
        where: {
          id: nouveauBlocId,
        },

        include: {
          section: {
            include: {
              terrain: true,
            },
          },
        },
      });

    if (!nouveauBloc) {
      throw new NotFoundException(
        'Nouveau bloc introuvable',
      );
    }

    const nouvelleSuperficieAncienBloc =
      ancienBloc.superficie -
      ancienneSuperficie;

    const nouvelleSuperficieNouveauBloc =
      nouveauBloc.superficie +
      nouvelleSuperficie;

    if (
      nouvelleSuperficieAncienBloc <= 0
    ) {
      throw new BadRequestException(
        `Impossible de déplacer cette parcelle. ` +
          `La superficie du bloc "${ancienBloc.reference}" ` +
          `deviendrait invalide.`,
      );
    }

    if (
      nouvelleSuperficieNouveauBloc <= 0
    ) {
      throw new BadRequestException(
        'La superficie du nouveau bloc doit être supérieure à 0 m².',
      );
    }

    if (
      nouvelleSuperficieNouveauBloc >
      nouveauBloc.section.terrain.superficie
    ) {
      throw new BadRequestException(
        `Impossible de déplacer la parcelle. ` +
          `La nouvelle superficie du bloc "${nouveauBloc.reference}" ` +
          `serait de ${nouvelleSuperficieNouveauBloc.toFixed(2)} m², ` +
          `alors que son terrain possède seulement ` +
          `${nouveauBloc.section.terrain.superficie.toFixed(2)} m².`,
      );
    }

    const resultat =
      await this.prisma.$transaction(
        async (tx) => {
          const parcelleModifiee =
            await tx.parcelle.update({
              where: {
                id,
              },

              data: updateParcelleDto,

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

                proprietaire: true,
              },
            });

          await tx.bloc.update({
            where: {
              id: ancienBlocId,
            },

            data: {
              superficie:
                nouvelleSuperficieAncienBloc,
            },
          });

          await tx.bloc.update({
            where: {
              id: nouveauBlocId,
            },

            data: {
              superficie:
                nouvelleSuperficieNouveauBloc,
            },
          });

          return parcelleModifiee;
        },
      );

    await this.historiqueService.create(
      'MODIFICATION',
      'PARCELLES',
      `Parcelle "${parcelle.reference}" déplacée du bloc "${ancienBloc.reference}" vers le bloc "${nouveauBloc.reference}".`,
    );

    return resultat;
  }

  // ============================================================
  // SUPPRESSION
  // ============================================================

  async remove(
    id: number,
  ) {
    const parcelle =
      await this.findOne(id);

    if (
      parcelle.proprietaireId !==
      null
    ) {
      throw new BadRequestException(
        'Impossible de supprimer une parcelle attribuée.',
      );
    }

    const parcelleSupprimee =
      await this.prisma.parcelle.delete({
        where: {
          id,
        },
      });

    await this.historiqueService.create(
      'SUPPRESSION',
      'PARCELLES',
      `Parcelle "${parcelle.reference}" supprimée`,
    );

    return parcelleSupprimee;
  }

  // ============================================================
  // ATTRIBUTION
  // ============================================================

  async attribuer(
    parcelleId: number,
    proprietaireId: number,
  ) {
    const parcelle =
      await this.prisma.parcelle.findUnique({
        where: {
          id: parcelleId,
        },
      });

    if (!parcelle) {
      throw new NotFoundException(
        'Parcelle introuvable',
      );
    }

    if (
      parcelle.proprietaireId !==
      null
    ) {
      throw new BadRequestException(
        'Cette parcelle est déjà attribuée.',
      );
    }

    const proprietaire =
      await this.prisma.proprietaire.findUnique({
        where: {
          id: proprietaireId,
        },
      });

    if (!proprietaire) {
      throw new NotFoundException(
        'Propriétaire introuvable',
      );
    }

    const parcelleAttribuee =
      await this.prisma.parcelle.update({
        where: {
          id: parcelleId,
        },

        data: {
          proprietaireId,
          statut: 'ATTRIBUEE',
          dateAttribution:
            new Date(),
        },

        include: {
          proprietaire: true,

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

    await this.historiqueService.create(
      'ATTRIBUTION',
      'PARCELLES',
      `Parcelle "${parcelle.reference}" attribuée à ${proprietaire.nom} ${proprietaire.prenom}`,
    );

    return parcelleAttribuee;
  }

  // ============================================================
  // COORDONNEES
  // ============================================================

  async updateCoordinates(
    id: number,
    latitude: number,
    longitude: number,
  ) {
    await this.findOne(id);

    return this.prisma.parcelle.update({
      where: {
        id,
      },

      data: {
        latitude,
        longitude,
      },

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

        proprietaire: true,
      },
    });
  }
}