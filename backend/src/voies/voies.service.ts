import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PositionVoie, StatutBloc, TypeVoie } from '@prisma/client';
import { CreateVoieDto } from './dto/create-voie.dto';
import { UpdateVoieDto } from './dto/update-voie.dto';

@Injectable()
export class VoiesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // UTILITAIRES
  // ============================================================

  private verifierTypePosition(
    type: TypeVoie,
    position: PositionVoie,
  ): void {
    if (
      (position === PositionVoie.HAUT ||
        position === PositionVoie.BAS) &&
      type !== TypeVoie.AVENUE
    ) {
      throw new BadRequestException(
        `La position ${position} doit être occupée par une AVENUE.`,
      );
    }

    if (
      (position === PositionVoie.GAUCHE ||
        position === PositionVoie.DROITE) &&
      type !== TypeVoie.RUELLE
    ) {
      throw new BadRequestException(
        `La position ${position} doit être occupée par une RUELLE.`,
      );
    }
  }

  private async getOccupationTerrain(
    terrainId: number,
  ): Promise<number> {
    const [sections, voies] = await Promise.all([
      this.prisma.section.findMany({
        where: { terrainId },
        select: { superficie: true },
      }),

      this.prisma.voie.findMany({
        where: { terrainId },
        select: { superficie: true },
      }),
    ]);

    const superficieSections = sections.reduce(
      (total, section) => total + section.superficie,
      0,
    );

    const superficieVoies = voies.reduce(
      (total, voie) => total + voie.superficie,
      0,
    );

    return superficieSections + superficieVoies;
  }

  private async verifierSuperficieDisponible(
    terrainId: number,
    superficieVoie: number,
    voieId?: number,
  ): Promise<void> {
    const terrain = await this.prisma.terrain.findUnique({
      where: { id: terrainId },
      select: {
        id: true,
        superficie: true,
      },
    });

    if (!terrain) {
      throw new NotFoundException(
        `Terrain ${terrainId} introuvable.`,
      );
    }

    const [sections, voies] = await Promise.all([
      this.prisma.section.findMany({
        where: { terrainId },
        select: { superficie: true },
      }),

      this.prisma.voie.findMany({
        where: {
          terrainId,
          ...(voieId
            ? {
                id: {
                  not: voieId,
                },
              }
            : {}),
        },
        select: { superficie: true },
      }),
    ]);

    const superficieSections = sections.reduce(
      (total, section) => total + section.superficie,
      0,
    );

    const superficieVoies = voies.reduce(
      (total, voie) => total + voie.superficie,
      0,
    );

    const occupationActuelle =
      superficieSections + superficieVoies;

    const superficieDisponible =
      terrain.superficie - occupationActuelle;

    if (superficieVoie > superficieDisponible) {
      throw new BadRequestException(
        `La superficie disponible du terrain est insuffisante. ` +
          `Disponible : ${Math.max(
            superficieDisponible,
            0,
          )} m².`,
      );
    }
  }

  private async verifierBlocTerrain(
    blocId: number,
    terrainId: number,
  ): Promise<void> {
    const bloc = await this.prisma.bloc.findUnique({
      where: { id: blocId },
      include: {
        section: {
          select: {
            terrainId: true,
          },
        },
      },
    });

    if (!bloc) {
      throw new NotFoundException(
        `Bloc ${blocId} introuvable.`,
      );
    }

    if (bloc.section.terrainId !== terrainId) {
      throw new BadRequestException(
        `Le bloc ${blocId} n'appartient pas au terrain ${terrainId}.`,
      );
    }
  }

  private async verifierAssociations(
    terrainId: number,
    type: TypeVoie,
    blocs: {
      blocId: number;
      position: PositionVoie;
    }[],
    voieId?: number,
  ): Promise<void> {
    const positionsParBloc = new Set<string>();

    for (const association of blocs) {
      const { blocId, position } = association;

      const cle = `${blocId}-${position}`;

      if (positionsParBloc.has(cle)) {
        throw new ConflictException(
          `Le bloc ${blocId} possède plusieurs associations pour la position ${position}.`,
        );
      }

      positionsParBloc.add(cle);

      await this.verifierBlocTerrain(
        blocId,
        terrainId,
      );

      this.verifierTypePosition(
        type,
        position,
      );

      /*
       * AUTRE peut être utilisé plusieurs fois.
       *
       * Pour HAUT, BAS, GAUCHE et DROITE,
       * une seule voie peut occuper une position
       * donnée sur un bloc.
       */
      if (position !== PositionVoie.AUTRE) {
        const associationExistante =
          await this.prisma.blocVoie.findFirst({
            where: {
              blocId,
              position,
              ...(voieId
                ? {
                    voieId: {
                      not: voieId,
                    },
                  }
                : {}),
            },
          });

        if (associationExistante) {
          throw new ConflictException(
            `La position ${position} du bloc ${blocId} est déjà occupée par une autre voie.`,
          );
        }
      }
    }
  }

  private async recalculerStatutBloc(
    blocId: number,
  ): Promise<void> {
    const associations =
      await this.prisma.blocVoie.findMany({
        where: {
          blocId,
        },
        select: {
          position: true,
        },
      });

    const positions = new Set(
      associations.map(
        (association) => association.position,
      ),
    );

    const obligatoire = [
      PositionVoie.HAUT,
      PositionVoie.BAS,
      PositionVoie.GAUCHE,
      PositionVoie.DROITE,
    ];

    const complet = obligatoire.every(
      (position) => positions.has(position),
    );

    await this.prisma.bloc.update({
      where: {
        id: blocId,
      },
      data: {
        statut: complet
          ? StatutBloc.TERMINE
          : StatutBloc.EN_COURS,
      },
    });
  }

  private async recalculerStatutsBlocs(
    blocIds: number[],
  ): Promise<void> {
    const idsUniques = [
      ...new Set(blocIds),
    ];

    for (const blocId of idsUniques) {
      await this.recalculerStatutBloc(
        blocId,
      );
    }
  }

  // ============================================================
  // CREATE
  // ============================================================

  async create(dto: CreateVoieDto) {
    const superficie =
      dto.largeur * dto.longueur;

    if (superficie <= 0) {
      throw new BadRequestException(
        'La superficie de la voie doit être supérieure à 0.',
      );
    }

    const voieExistante =
      await this.prisma.voie.findUnique({
        where: {
          reference: dto.reference,
        },
      });

    if (voieExistante) {
      throw new ConflictException(
        `La référence ${dto.reference} est déjà utilisée.`,
      );
    }

    const associations =
      dto.blocs ?? [];

    await this.verifierAssociations(
      dto.terrainId,
      dto.type,
      associations,
    );

    await this.verifierSuperficieDisponible(
      dto.terrainId,
      superficie,
    );

    const voie =
      await this.prisma.voie.create({
        data: {
          reference: dto.reference,
          type: dto.type,
          largeur: dto.largeur,
          longueur: dto.longueur,
          superficie,
          terrainId: dto.terrainId,

          blocs: {
            create: associations.map(
              (association) => ({
                blocId:
                  association.blocId,
                position:
                  association.position,
              }),
            ),
          },
        },

        include: {
          terrain: true,

          blocs: {
            include: {
              bloc: {
                include: {
                  section: true,
                },
              },
            },
          },
        },
      });

    await this.recalculerStatutsBlocs(
      associations.map(
        (association) =>
          association.blocId,
      ),
    );

    return voie;
  }

  // ============================================================
  // FIND ALL
  // ============================================================

  async findAll() {
    return this.prisma.voie.findMany({
      orderBy: {
        id: 'desc',
      },

      include: {
        terrain: true,

        blocs: {
          include: {
            bloc: {
              include: {
                section: true,
              },
            },
          },
        },
      },
    });
  }

  // ============================================================
  // FIND ONE
  // ============================================================

  async findOne(id: number) {
    const voie =
      await this.prisma.voie.findUnique({
        where: {
          id,
        },

        include: {
          terrain: true,

          blocs: {
            include: {
              bloc: {
                include: {
                  section: true,
                },
              },
            },
          },
        },
      });

    if (!voie) {
      throw new NotFoundException(
        `Voie ${id} introuvable.`,
      );
    }

    return voie;
  }

  // ============================================================
  // FIND BY TERRAIN
  // ============================================================

  async findByTerrain(
    terrainId: number,
  ) {
    const terrain =
      await this.prisma.terrain.findUnique({
        where: {
          id: terrainId,
        },
      });

    if (!terrain) {
      throw new NotFoundException(
        `Terrain ${terrainId} introuvable.`,
      );
    }

    return this.prisma.voie.findMany({
      where: {
        terrainId,
      },

      orderBy: {
        id: 'asc',
      },

      include: {
        blocs: {
          include: {
            bloc: {
              include: {
                section: true,
              },
            },
          },
        },
      },
    });
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    id: number,
    dto: UpdateVoieDto,
  ) {
    const voieExistante =
      await this.prisma.voie.findUnique({
        where: {
          id,
        },

        include: {
          blocs: true,
        },
      });

    if (!voieExistante) {
      throw new NotFoundException(
        `Voie ${id} introuvable.`,
      );
    }

    // ----------------------------------------------------------
    // Vérification de la référence
    // ----------------------------------------------------------

    if (
      dto.reference !== undefined &&
      dto.reference !==
        voieExistante.reference
    ) {
      const referenceExistante =
        await this.prisma.voie.findUnique({
          where: {
            reference:
              dto.reference,
          },
        });

      if (
        referenceExistante &&
        referenceExistante.id !== id
      ) {
        throw new ConflictException(
          `La référence ${dto.reference} est déjà utilisée.`,
        );
      }
    }

    // ----------------------------------------------------------
    // Calcul des nouvelles valeurs
    // ----------------------------------------------------------

    const nouveauType =
      dto.type ??
      voieExistante.type;

    const nouvelleLargeur =
      dto.largeur ??
      voieExistante.largeur;

    const nouvelleLongueur =
      dto.longueur ??
      voieExistante.longueur;

    const nouvelleSuperficie =
      nouvelleLargeur *
      nouvelleLongueur;

    // ----------------------------------------------------------
    // Associations
    // ----------------------------------------------------------

    const nouvellesAssociations =
      dto.blocs !== undefined
        ? dto.blocs
        : voieExistante.blocs.map(
            (association) => ({
              blocId:
                association.blocId,
              position:
                association.position,
            }),
          );

    await this.verifierAssociations(
      voieExistante.terrainId,
      nouveauType,
      nouvellesAssociations,
      id,
    );

    // ----------------------------------------------------------
    // Vérification superficie
    // ----------------------------------------------------------

    if (
      nouvelleSuperficie !==
      voieExistante.superficie
    ) {
      await this.verifierSuperficieDisponible(
        voieExistante.terrainId,
        nouvelleSuperficie,
        id,
      );
    }

    // ----------------------------------------------------------
    // Blocs à recalculer
    // ----------------------------------------------------------

    const anciensBlocs =
      voieExistante.blocs.map(
        (association) =>
          association.blocId,
      );

    const nouveauxBlocs =
      nouvellesAssociations.map(
        (association) =>
          association.blocId,
      );

    const blocsARecalculer = [
      ...anciensBlocs,
      ...nouveauxBlocs,
    ];

    // ----------------------------------------------------------
    // Transaction
    // ----------------------------------------------------------

    const voie =
      await this.prisma.$transaction(
        async (tx) => {
          /*
           * Si dto.blocs est fourni explicitement,
           * nous remplaçons les associations.
           *
           * Sinon, nous conservons les associations
           * déjà présentes en base.
           */
          if (dto.blocs !== undefined) {
            await tx.blocVoie.deleteMany({
              where: {
                voieId: id,
              },
            });

            if (
              nouvellesAssociations.length >
              0
            ) {
              await tx.blocVoie.createMany({
                data:
                  nouvellesAssociations.map(
                    (association) => ({
                      blocId:
                        association.blocId,
                      voieId: id,
                      position:
                        association.position,
                    }),
                  ),
              });
            }
          }

          return tx.voie.update({
            where: {
              id,
            },

            data: {
              ...(dto.reference !==
              undefined
                ? {
                    reference:
                      dto.reference,
                  }
                : {}),

              ...(dto.type !==
              undefined
                ? {
                    type:
                      dto.type,
                  }
                : {}),

              ...(dto.largeur !==
              undefined
                ? {
                    largeur:
                      dto.largeur,
                  }
                : {}),

              ...(dto.longueur !==
              undefined
                ? {
                    longueur:
                      dto.longueur,
                  }
                : {}),

              superficie:
                nouvelleSuperficie,
            },

            include: {
              terrain: true,

              blocs: {
                include: {
                  bloc: {
                    include: {
                      section: true,
                    },
                  },
                },
              },
            },
          });
        },
      );

    // ----------------------------------------------------------
    // Recalcul des statuts
    // ----------------------------------------------------------

    await this.recalculerStatutsBlocs(
      blocsARecalculer,
    );

    return voie;
  }

  // ============================================================
  // REMOVE
  // ============================================================

  async remove(id: number) {
    const voie =
      await this.prisma.voie.findUnique({
        where: {
          id,
        },

        include: {
          blocs: true,
        },
      });

    if (!voie) {
      throw new NotFoundException(
        `Voie ${id} introuvable.`,
      );
    }

    const blocsARecalculer =
      voie.blocs.map(
        (association) =>
          association.blocId,
      );

    await this.prisma.voie.delete({
      where: {
        id,
      },
    });

    /*
     * Les associations BlocVoie sont supprimées
     * automatiquement grâce à ON DELETE CASCADE.
     */

    await this.recalculerStatutsBlocs(
      blocsARecalculer,
    );

    return {
      message:
        'Voie supprimée avec succès.',
      id,
    };
  }
}