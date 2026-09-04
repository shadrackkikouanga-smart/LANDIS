import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(
    private prisma: PrismaService,
    private historiqueService: HistoriqueService,
  ) {}

  // ============================================================
  // CRÉATION
  // ============================================================

  async create(createSectionDto: CreateSectionDto) {
    const terrain = await this.prisma.terrain.findUnique({
      where: {
        id: createSectionDto.terrainId,
      },
      include: {
        sections: true,
      },
    });

    if (!terrain) {
      throw new NotFoundException(
        'Terrain introuvable',
      );
    }

    if (createSectionDto.superficie <= 0) {
      throw new BadRequestException(
        'La superficie de la section doit être supérieure à 0.',
      );
    }

    // ==========================================================
    // VÉRIFICATION DE LA SUPERFICIE DU TERRAIN
    // ==========================================================

    const superficieSections =
      terrain.sections.reduce(
        (total, section) =>
          total + section.superficie,
        0,
      );

    const superficieApresAjout =
      superficieSections +
      createSectionDto.superficie;

    if (
      superficieApresAjout >
      terrain.superficie
    ) {
      const superficieDisponible =
        terrain.superficie -
        superficieSections;

      throw new BadRequestException(
        `Impossible de créer cette section. Il reste seulement ${superficieDisponible.toFixed(2)} m² disponibles sur le terrain "${terrain.reference}".`,
      );
    }

    // ==========================================================
    // CRÉATION
    // ==========================================================

    const section =
      await this.prisma.section.create({
        data: {
          reference:
            createSectionDto.reference,

          nom:
            createSectionDto.nom,

          superficie:
            createSectionDto.superficie,

          terrainId:
            createSectionDto.terrainId,
        },

        include: {
          terrain: true,
          blocs: true,
        },
      });

    await this.historiqueService.create(
      'CREATION',
      'SECTIONS',
      `Section "${section.reference}" créée sur le terrain "${terrain.reference}"`,
    );

    return section;
  }

  // ============================================================
  // TOUTES LES SECTIONS
  // ============================================================

  async findAll() {
    return this.prisma.section.findMany({
      include: {
        terrain: true,

        blocs: {
          include: {
            parcelles: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ============================================================
  // UNE SECTION
  // ============================================================

  async findOne(id: number) {
    const section =
      await this.prisma.section.findUnique({
        where: {
          id,
        },

        include: {
          terrain: true,

          blocs: {
            include: {
              parcelles: true,
            },
          },
        },
      });

    if (!section) {
      throw new NotFoundException(
        'Section introuvable',
      );
    }

    const superficieBlocs =
      section.blocs.reduce(
        (total, bloc) =>
          total + bloc.superficie,
        0,
      );

    const superficieRestante =
      section.superficie -
      superficieBlocs;

    const nombreParcelles =
      section.blocs.reduce(
        (total, bloc) =>
          total + bloc.parcelles.length,
        0,
      );

    const nombreParcellesDeclarees =
      section.blocs.reduce(
        (total, bloc) =>
          total + bloc.nombreParcelles,
        0,
      );

    return {
      ...section,

      statistiques: {
        superficieSection:
          section.superficie,

        superficieBlocs:
          Number(
            superficieBlocs.toFixed(2),
          ),

        superficieRestante:
          Number(
            superficieRestante.toFixed(2),
          ),

        nombreBlocs:
          section.blocs.length,

        nombreParcelles,

        nombreParcellesDeclarees,

        ecartParcelles:
          nombreParcellesDeclarees -
          nombreParcelles,

        tauxOccupation:
          section.superficie === 0
            ? 0
            : Number(
                (
                  (superficieBlocs /
                    section.superficie) *
                  100
                ).toFixed(2),
              ),
      },
    };
  }

  // ============================================================
  // SECTIONS D'UN TERRAIN
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
        'Terrain introuvable',
      );
    }

    return this.prisma.section.findMany({
      where: {
        terrainId,
      },

      include: {
        blocs: {
          include: {
            parcelles: true,
          },
        },
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // ============================================================
  // MODIFICATION
  // ============================================================

  async update(
    id: number,
    updateSectionDto: UpdateSectionDto,
  ) {
    const section =
      await this.prisma.section.findUnique({
        where: {
          id,
        },

        include: {
          blocs: true,
        },
      });

    if (!section) {
      throw new NotFoundException(
        'Section introuvable',
      );
    }

    const terrainId =
      updateSectionDto.terrainId ??
      section.terrainId;

    const terrain =
      await this.prisma.terrain.findUnique({
        where: {
          id: terrainId,
        },

        include: {
          sections: true,
        },
      });

    if (!terrain) {
      throw new NotFoundException(
        'Terrain cible introuvable',
      );
    }

    const nouvelleSuperficie =
      updateSectionDto.superficie !==
      undefined
        ? Number(
            updateSectionDto.superficie,
          )
        : section.superficie;

    const superficieBlocs =
      section.blocs.reduce(
        (total, bloc) =>
          total + bloc.superficie,
        0,
      );

    if (
      nouvelleSuperficie <
      superficieBlocs
    ) {
      throw new BadRequestException(
        `Impossible de réduire la section à ${nouvelleSuperficie} m² : ses blocs occupent déjà ${superficieBlocs.toFixed(2)} m².`,
      );
    }

    // ==========================================================
    // SI LE TERRAIN CHANGE
    // ==========================================================

    if (
      terrainId !==
      section.terrainId
    ) {
      const superficieAutresSections =
        terrain.sections
          .filter(
            (s) =>
              s.id !== section.id,
          )
          .reduce(
            (total, s) =>
              total + s.superficie,
            0,
          );

      if (
        superficieAutresSections +
          nouvelleSuperficie >
        terrain.superficie
      ) {
        throw new BadRequestException(
          `La superficie disponible sur le terrain cible est insuffisante.`,
        );
      }
    }

    // ==========================================================
    // MISE À JOUR
    // ==========================================================

    const sectionModifiee =
      await this.prisma.section.update({
        where: {
          id,
        },

        data: {
          reference:
            updateSectionDto.reference ??
            section.reference,

          nom:
            updateSectionDto.nom ??
            section.nom,

          superficie:
            nouvelleSuperficie,

          terrainId,
        },

        include: {
          terrain: true,
          blocs: true,
        },
      });

    await this.historiqueService.create(
      'MODIFICATION',
      'SECTIONS',
      `Section "${sectionModifiee.reference}" modifiée`,
    );

    return this.findOne(
      sectionModifiee.id,
    );
  }

  // ============================================================
  // SUPPRESSION
  // ============================================================

  async remove(id: number) {
    const section =
      await this.findOne(id);

    if (
      section.blocs.length > 0
    ) {
      throw new BadRequestException(
        'Impossible de supprimer cette section car elle contient encore des blocs.',
      );
    }

    const sectionSupprimee =
      await this.prisma.section.delete({
        where: {
          id,
        },
      });

    await this.historiqueService.create(
      'SUPPRESSION',
      'SECTIONS',
      `Section "${section.reference}" supprimée`,
    );

    return sectionSupprimee;
  }
}