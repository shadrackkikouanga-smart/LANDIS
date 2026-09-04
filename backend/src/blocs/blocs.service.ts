import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  PositionVoie,
  StatutBloc,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateBlocDto } from './dto/create-bloc.dto';
import { UpdateBlocDto } from './dto/update-bloc.dto';

@Injectable()
export class BlocsService {
  constructor(
    private prisma: PrismaService,
    private historiqueService: HistoriqueService,
  ) {}

  // ============================================================
  // RECALCUL DU STATUT DU BLOC
  // ============================================================

  private async recalculerStatutBloc(
    blocId: number,
  ) {
    const voies =
      await this.prisma.blocVoie.findMany({
        where: {
          blocId,
        },

        select: {
          position: true,
        },
      });

    const positions =
      new Set(
        voies.map(
          (voie) =>
            voie.position,
        ),
      );

    const positionsObligatoires:
      PositionVoie[] = [
        PositionVoie.HAUT,
        PositionVoie.BAS,
        PositionVoie.GAUCHE,
        PositionVoie.DROITE,
      ];

    const blocTermine =
      positionsObligatoires.every(
        (position) =>
          positions.has(position),
      );

    const statut =
      blocTermine
        ? StatutBloc.TERMINE
        : StatutBloc.EN_COURS;

    return this.prisma.bloc.update({
      where: {
        id: blocId,
      },

      data: {
        statut,
      },
    });
  }

  // ============================================================
  // CREATION
  // ============================================================

  async create(
    createBlocDto: CreateBlocDto,
  ) {
    const section =
      await this.prisma.section.findUnique({
        where: {
          id:
            createBlocDto.sectionId,
        },

        include: {
          terrain: true,
        },
      });

    if (!section) {
      throw new NotFoundException(
        'Section introuvable',
      );
    }

    const blocIncomplet =
      await this.prisma.bloc.findFirst({
        where: {
          sectionId:
            createBlocDto.sectionId,

          statut:
            StatutBloc.EN_COURS,
        },
      });

    if (blocIncomplet) {
      throw new BadRequestException(
        `Impossible de créer ce bloc. ` +
          `Le bloc "${blocIncomplet.reference}" ` +
          `de cette section est encore en cours de création.`,
      );
    }

    const blocsExistants =
      await this.prisma.bloc.aggregate({
        where: {
          sectionId:
            createBlocDto.sectionId,
        },

        _sum: {
          superficie: true,
        },
      });

    const superficieDejaUtilisee =
      blocsExistants._sum
        .superficie ?? 0;

    const nouvelleSuperficie =
      Number(
        createBlocDto.superficie,
      );

    const superficieApresAjout =
      superficieDejaUtilisee +
      nouvelleSuperficie;

    if (
      superficieApresAjout >
      section.superficie
    ) {
      const superficieDisponible =
        section.superficie -
        superficieDejaUtilisee;

      throw new BadRequestException(
        `Impossible de créer ce bloc. ` +
          `La section "${section.reference}" ` +
          `possède une superficie de ${section.superficie} m². ` +
          `Il reste seulement ${superficieDisponible.toFixed(2)} m² disponibles.`,
      );
    }

    if (
      nouvelleSuperficie <= 0
    ) {
      throw new BadRequestException(
        'La superficie du bloc doit être supérieure à 0 m².',
      );
    }

    if (
      createBlocDto.nombreParcelles <=
      0
    ) {
      throw new BadRequestException(
        'Le bloc doit contenir au moins une parcelle.',
      );
    }

    const bloc =
      await this.prisma.bloc.create({
        data: {
          reference:
            createBlocDto.reference,

          nombreParcelles:
            createBlocDto.nombreParcelles,

          superficie:
            nouvelleSuperficie,

          sectionId:
            createBlocDto.sectionId,

          statut:
            StatutBloc.EN_COURS,

          latitude:
            createBlocDto.latitude,

          longitude:
            createBlocDto.longitude,
        },
      });

    const superficieParcelle =
      bloc.superficie /
      bloc.nombreParcelles;

    const parcelles: {
      reference: string;
      numero: string;
      superficie: number;
      blocId: number;
    }[] = [];

    for (
      let i = 1;
      i <= bloc.nombreParcelles;
      i++
    ) {
      parcelles.push({
        reference:
          `${bloc.reference}-P${i}`,

        numero:
          String(i),

        superficie:
          superficieParcelle,

        blocId:
          bloc.id,
      });
    }

    await this.prisma.parcelle.createMany({
      data: parcelles,
    });

    const resultat =
      await this.findOne(
        bloc.id,
      );

    await this.historiqueService.create(
      'CREATION',
      'BLOCS',
      `Bloc "${bloc.reference}" créé avec ${bloc.nombreParcelles} parcelles dans la section "${section.reference}"`,
    );

    return resultat;
  }

  // ============================================================
  // CREATION BLOC COMPLET
  // ============================================================

  async createBlocComplet(
    createBlocDto: CreateBlocDto,
  ) {
    return this.create(
      createBlocDto,
    );
  }

  // ============================================================
  // LISTE
  // ============================================================

  async findAll() {
    return this.prisma.bloc.findMany({
      include: {
        section: {
          include: {
            terrain: true,
          },
        },

        parcelles: true,

        voies: {
          include: {
            voie: true,
          },

          orderBy: {
            position: 'asc',
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ============================================================
  // DETAIL
  // ============================================================

  async findOne(
    id: number,
  ) {
    const bloc =
      await this.prisma.bloc.findUnique({
        where: {
          id,
        },

        include: {
          section: {
            include: {
              terrain: true,
            },
          },

          parcelles: true,

          voies: {
            include: {
              voie: true,
            },

            orderBy: {
              position: 'asc',
            },
          },
        },
      });

    if (!bloc) {
      throw new NotFoundException(
        'Bloc introuvable',
      );
    }

    const blocStatut =
      await this.recalculerStatutBloc(
        bloc.id,
      );

    const nombreParcellesReelles =
      bloc.parcelles.length;

    const ecartParcelles =
      bloc.nombreParcelles -
      nombreParcellesReelles;

    const etatBloc =
      ecartParcelles === 0
        ? 'COMPLET'
        : 'INCOMPLET';

    const parcellesAttribuees =
      bloc.parcelles.filter(
        (parcelle) =>
          parcelle.proprietaireId !==
          null,
      );

    const nombreParcellesAttribuees =
      parcellesAttribuees.length;

    const nombreParcellesDisponibles =
      nombreParcellesReelles -
      nombreParcellesAttribuees;

    const surfaceOccupee =
      parcellesAttribuees.reduce(
        (
          total,
          parcelle,
        ) =>
          total +
          parcelle.superficie,
        0,
      );

    const surfaceDisponible =
      bloc.superficie -
      surfaceOccupee;

    const tauxOccupation =
      bloc.superficie === 0
        ? 0
        : Number(
            (
              (surfaceOccupee /
                bloc.superficie) *
              100
            ).toFixed(2),
          );

    const voies =
      bloc.voies;

    const positionsVoies =
      new Set(
        voies.map(
          (association) =>
            association.position,
        ),
      );

    const positionsObligatoires:
      PositionVoie[] = [
        PositionVoie.HAUT,
        PositionVoie.BAS,
        PositionVoie.GAUCHE,
        PositionVoie.DROITE,
      ];

    const voiesManquantes =
      positionsObligatoires.filter(
        (position) =>
          !positionsVoies.has(
            position,
          ),
      );

    const superficieVoies =
      voies.reduce(
        (
          total,
          association,
        ) =>
          total +
          association.voie.superficie,
        0,
      );

    const voiesPrincipales =
      voies.filter(
        (association) =>
          association.position !==
          PositionVoie.AUTRE,
      );

    return {
      ...bloc,

      statut:
        blocStatut.statut,

      terrain:
        bloc.section?.terrain,

      statistiques: {
        nombreParcellesDeclarees:
          bloc.nombreParcelles,

        nombreParcellesReelles,

        ecartParcelles,

        etatBloc,

        parcellesDisponibles:
          nombreParcellesDisponibles,

        parcellesAttribuees:
          nombreParcellesAttribuees,

        surfaceTotaleBloc:
          bloc.superficie,

        surfaceOccupee:
          Number(
            surfaceOccupee.toFixed(2),
          ),

        surfaceDisponible:
          Number(
            surfaceDisponible.toFixed(2),
          ),

        tauxOccupation,

        nombreVoies:
          voies.length,

        nombreVoiesPrincipales:
          voiesPrincipales.length,

        superficieVoies:
          Number(
            superficieVoies.toFixed(2),
          ),

        voiesManquantes,

        quadrillageComplet:
          voiesManquantes.length ===
          0,
      },
    };
  }

  // ============================================================
  // STATISTIQUES
  // ============================================================

  async statistiques(
    id: number,
  ) {
    const bloc =
      await this.prisma.bloc.findUnique({
        where: {
          id,
        },

        include: {
          parcelles: true,

          voies: {
            include: {
              voie: true,
            },
          },
        },
      });

    if (!bloc) {
      throw new NotFoundException(
        'Bloc introuvable',
      );
    }

    const blocStatut =
      await this.recalculerStatutBloc(
        bloc.id,
      );

    const totalReel =
      bloc.parcelles.length;

    const parcellesAttribuees =
      bloc.parcelles.filter(
        (parcelle) =>
          parcelle.proprietaireId !==
          null,
      ).length;

    const parcellesDisponibles =
      totalReel -
      parcellesAttribuees;

    const tauxOccupation =
      totalReel === 0
        ? 0
        : Number(
            (
              (parcellesAttribuees /
                totalReel) *
              100
            ).toFixed(2),
          );

    const difference =
      bloc.nombreParcelles -
      totalReel;

    const positionsVoies =
      new Set(
        bloc.voies.map(
          (association) =>
            association.position,
        ),
      );

    const positionsObligatoires:
      PositionVoie[] = [
        PositionVoie.HAUT,
        PositionVoie.BAS,
        PositionVoie.GAUCHE,
        PositionVoie.DROITE,
      ];

    const voiesManquantes =
      positionsObligatoires.filter(
        (position) =>
          !positionsVoies.has(
            position,
          ),
      );

    const superficieVoies =
      bloc.voies.reduce(
        (
          total,
          association,
        ) =>
          total +
          association.voie.superficie,
        0,
      );

    return {
      blocId:
        bloc.id,

      reference:
        bloc.reference,

      superficie:
        bloc.superficie,

      statut:
        blocStatut.statut,

      nombreDeclareDansBloc:
        bloc.nombreParcelles,

      nombreReelParcelles:
        totalReel,

      anomalie:
        difference !== 0
          ? {
              existe: true,

              difference,

              message:
                'Le nombre de parcelles du bloc ne correspond pas aux parcelles enregistrées.',
            }
          : {
              existe: false,
            },

      parcellesAttribuees,

      parcellesDisponibles,

      tauxOccupation,

      voies: {
        nombre:
          bloc.voies.length,

        superficie:
          Number(
            superficieVoies.toFixed(2),
          ),

        voiesManquantes,

        quadrillageComplet:
          voiesManquantes.length ===
          0,
      },
    };
  }

  // ============================================================
  // MODIFICATION
  // ============================================================

  async update(
    id: number,
    updateBlocDto: UpdateBlocDto,
  ) {
    const blocActuel =
      await this.prisma.bloc.findUnique({
        where: {
          id,
        },
      });

    if (!blocActuel) {
      throw new NotFoundException(
        'Bloc introuvable',
      );
    }

    const sectionId =
      updateBlocDto.sectionId ??
      blocActuel.sectionId;

    const section =
      await this.prisma.section.findUnique({
        where: {
          id: sectionId,
        },

        include: {
          terrain: true,
        },
      });

    if (!section) {
      throw new NotFoundException(
        'Section cible introuvable',
      );
    }

    /*
     * Un bloc qui possède déjà des voies associées
     * ne peut pas être déplacé vers un autre terrain.
     *
     * Une association BlocVoie décrit les limites physiques
     * du bloc sur son terrain. La conserver après un changement
     * de terrain créerait une incohérence géographique.
     */
    if (
      sectionId !== blocActuel.sectionId
    ) {
      const voiesAssociees =
        await this.prisma.blocVoie.count({
          where: {
            blocId: id,
          },
        });

      if (voiesAssociees > 0) {
        const sectionActuelle =
          await this.prisma.section.findUnique({
            where: {
              id: blocActuel.sectionId,
            },

            include: {
              terrain: true,
            },
          });

        if (
          sectionActuelle &&
          sectionActuelle.terrainId !==
            section.terrainId
        ) {
          throw new BadRequestException(
            `Impossible de déplacer le bloc "${blocActuel.reference}" vers le terrain "${section.terrain.reference}" car il possède déjà ${voiesAssociees} voie(s) associée(s). ` +
              `Les voies doivent d'abord être détachées du bloc avant tout changement de terrain.`,
          );
        }
      }
    }

    const superficie =
      updateBlocDto.superficie ??
      blocActuel.superficie;

    if (superficie <= 0) {
      throw new BadRequestException(
        'La superficie du bloc doit être supérieure à 0 m².',
      );
    }

    const autresBlocs =
      await this.prisma.bloc.aggregate({
        where: {
          sectionId,

          id: {
            not: id,
          },
        },

        _sum: {
          superficie: true,
        },
      });

    const superficieAutresBlocs =
      autresBlocs._sum.superficie ??
      0;

    const superficieApresModification =
      superficieAutresBlocs +
      superficie;

    if (
      superficieApresModification >
      section.superficie
    ) {
      const superficieDisponible =
        section.superficie -
        superficieAutresBlocs;

      throw new BadRequestException(
        `Impossible de modifier ce bloc. ` +
          `La section "${section.reference}" ` +
          `possède une superficie de ${section.superficie} m². ` +
          `Il reste seulement ${superficieDisponible.toFixed(2)} m² disponibles.`,
      );
    }

    const nombreParcelles =
      updateBlocDto.nombreParcelles ??
      blocActuel.nombreParcelles;

    if (
      nombreParcelles <= 0
    ) {
      throw new BadRequestException(
        'Le bloc doit conserver au moins une parcelle.',
      );
    }

    const blocMisAJour =
      await this.prisma.bloc.update({
        where: {
          id,
        },

        data: {
          reference:
            updateBlocDto.reference ??
            blocActuel.reference,

          superficie,

          nombreParcelles,

          sectionId,

          latitude:
            updateBlocDto.latitude ??
            blocActuel.latitude,

          longitude:
            updateBlocDto.longitude ??
            blocActuel.longitude,
        },
      });

    const parcelles =
      await this.prisma.parcelle.findMany({
        where: {
          blocId: id,
        },

        orderBy: {
          id: 'asc',
        },
      });

    const parcellesDisponibles =
      parcelles.filter(
        (parcelle) =>
          parcelle.proprietaireId ===
          null,
      );

    if (
      parcelles.length >
      nombreParcelles
    ) {
      const nombreASupprimer =
        parcelles.length -
        nombreParcelles;

      const disponiblesASupprimer =
        parcellesDisponibles.slice(
          -nombreASupprimer,
        );

      if (
        disponiblesASupprimer.length <
        nombreASupprimer
      ) {
        throw new BadRequestException(
          'Impossible de réduire le nombre de parcelles : certaines parcelles sont déjà attribuées.',
        );
      }

      await this.prisma.parcelle.deleteMany({
        where: {
          id: {
            in:
              disponiblesASupprimer.map(
                (parcelle) =>
                  parcelle.id,
              ),
          },
        },
      });
    }

    let parcellesActuelles =
      await this.prisma.parcelle.findMany({
        where: {
          blocId: id,
        },

        orderBy: {
          id: 'asc',
        },
      });

    if (
      parcellesActuelles.length <
      nombreParcelles
    ) {
      const dernierNumero =
        parcellesActuelles.reduce(
          (
            max,
            parcelle,
          ) =>
            Math.max(
              max,
              Number(
                parcelle.numero,
              ) || 0,
            ),
          0,
        );

      const nombreACreer =
        nombreParcelles -
        parcellesActuelles.length;

      const nouvellesParcelles: {
        reference: string;
        numero: string;
        superficie: number;
        blocId: number;
      }[] = [];

      for (
        let i = 1;
        i <= nombreACreer;
        i++
      ) {
        const numero =
          dernierNumero + i;

        nouvellesParcelles.push({
          reference:
            `${blocMisAJour.reference}-P${numero}`,

          numero:
            String(numero),

          superficie:
            superficie /
            nombreParcelles,

          blocId:
            id,
        });
      }

      await this.prisma.parcelle.createMany({
        data:
          nouvellesParcelles,
      });

      parcellesActuelles =
        await this.prisma.parcelle.findMany({
          where: {
            blocId: id,
          },

          orderBy: {
            id: 'asc',
          },
        });
    }

    const nouvelleSuperficieParcelle =
      superficie /
      nombreParcelles;

    await this.prisma.parcelle.updateMany({
      where: {
        blocId: id,

        proprietaireId: null,
      },

      data: {
        superficie:
          nouvelleSuperficieParcelle,
      },
    });

    await this.recalculerStatutBloc(
      id,
    );

    await this.historiqueService.create(
      'MODIFICATION',
      'BLOCS',
      `Bloc "${blocMisAJour.reference}" modifié`,
    );

    return this.findOne(
      blocMisAJour.id,
    );
  }

  // ============================================================
  // SUPPRESSION
  // ============================================================

  async remove(
    id: number,
  ) {
    const bloc =
      await this.prisma.bloc.findUnique({
        where: {
          id,
        },

        include: {
          parcelles: true,

          voies: true,
        },
      });

    if (!bloc) {
      throw new NotFoundException(
        'Bloc introuvable',
      );
    }

    const parcellesAttribuees =
      bloc.parcelles.filter(
        (parcelle) =>
          parcelle.proprietaireId !==
          null,
      );

    if (
      parcellesAttribuees.length >
      0
    ) {
      throw new BadRequestException(
        `Impossible de supprimer le bloc "${bloc.reference}" car ${parcellesAttribuees.length} parcelle(s) sont déjà attribuée(s).`,
      );
    }

    await this.prisma.$transaction(
      async (tx) => {
        /*
         * Les relations BlocVoie sont supprimées
         * automatiquement avec le bloc grâce à
         * onDelete: Cascade.
         *
         * Les voies physiques restent dans le terrain.
         */
        await tx.parcelle.deleteMany({
          where: {
            blocId: id,
          },
        });

        await tx.bloc.delete({
          where: {
            id,
          },
        });
      },
    );

    await this.historiqueService.create(
      'SUPPRESSION',
      'BLOCS',
      `Bloc "${bloc.reference}" supprimé avec ${bloc.parcelles.length} parcelle(s)`,
    );

    return {
      message:
        `Bloc "${bloc.reference}" supprimé avec succès.`,

      blocId:
        bloc.id,

      reference:
        bloc.reference,

      parcellesSupprimees:
        bloc.parcelles.length,

      voiesDetachees:
        bloc.voies.length,
    };
  }

  // ============================================================
  // AJOUTER DES PARCELLES
  // ============================================================

  async ajouterParcelles(
    id: number,
    data: {
      quantite: number;
    },
  ) {
    const bloc =
      await this.prisma.bloc.findUnique({
        where: {
          id,
        },
      });

    if (!bloc) {
      throw new NotFoundException(
        'Bloc introuvable',
      );
    }

    if (
      data.quantite <= 0
    ) {
      throw new BadRequestException(
        'La quantité doit être supérieure à 0.',
      );
    }

    const nouveauNombre =
      bloc.nombreParcelles +
      data.quantite;

    return this.update(
      id,
      {
        nombreParcelles:
          nouveauNombre,
      },
    );
  }

  // ============================================================
  // REDUIRE DES PARCELLES
  // ============================================================

  async reduireParcelles(
    id: number,
    data: {
      quantite: number;
    },
  ) {
    const bloc =
      await this.prisma.bloc.findUnique({
        where: {
          id,
        },
      });

    if (!bloc) {
      throw new NotFoundException(
        'Bloc introuvable',
      );
    }

    if (
      data.quantite <= 0
    ) {
      throw new BadRequestException(
        'La quantité doit être supérieure à 0.',
      );
    }

    const nouveauNombre =
      bloc.nombreParcelles -
      data.quantite;

    if (
      nouveauNombre <= 0
    ) {
      throw new BadRequestException(
        'Le bloc doit conserver au moins une parcelle.',
      );
    }

    return this.update(
      id,
      {
        nombreParcelles:
          nouveauNombre,
      },
    );
  }

  // ============================================================
  // COORDONNEES
  // ============================================================

  async updateCoordinates(
    id: number,
    data: {
      latitude: number;
      longitude: number;
    },
  ) {
    const bloc =
      await this.prisma.bloc.findUnique({
        where: {
          id,
        },
      });

    if (!bloc) {
      throw new NotFoundException(
        'Bloc introuvable',
      );
    }

    const blocModifie =
      await this.prisma.bloc.update({
        where: {
          id,
        },

        data: {
          latitude:
            data.latitude,

          longitude:
            data.longitude,
        },
      });

    await this.historiqueService.create(
      'MODIFICATION',
      'BLOCS',
      `Coordonnées mises à jour pour le bloc "${bloc.reference}"`,
    );

    return this.findOne(
      blocModifie.id,
    );
  }
}