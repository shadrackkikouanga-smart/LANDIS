import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateTerrainDto } from './dto/create-terrain.dto';
import { UpdateTerrainDto } from './dto/update-terrain.dto';

@Injectable()
export class TerrainsService {
  constructor(
    private prisma: PrismaService,
    private historiqueService: HistoriqueService,
  ) {}

  // ============================================================
  // CREATION D'UN TERRAIN
  // ============================================================
  async create(
    createTerrainDto: CreateTerrainDto,
  ) {
    const terrain =
      await this.prisma.terrain.create({
        data: {
          reference: createTerrainDto.reference,
          nom: createTerrainDto.nom,
          superficie: Number(createTerrainDto.superficie),
          localisation:
            createTerrainDto.localisation,
          statut:
            createTerrainDto.statut || 'EN_COURS',
          projectId:
            Number(createTerrainDto.projectId),
        },
        include: {
          project: true,
          sections: true,
          voies: true,
        },
      });

    await this.historiqueService.create(
      'CREATION',
      'TERRAINS',
      `Terrain "${terrain.nom}" (${terrain.reference}) créé`,
    );

    return terrain;
  }

  // ============================================================
  // LISTE DE TOUS LES TERRAINS
  // ============================================================
  async findAll() {
    return this.prisma.terrain.findMany({
      include: {
        project: true,

        voies: true,

        sections: {
          include: {
            blocs: {
              include: {
                parcelles: true,
              },
            },
          },
        },
      },
    });
  }

  // ============================================================
  // DETAIL D'UN TERRAIN
  // ============================================================
  async findOne(id: number) {
    const terrain =
      await this.prisma.terrain.findUnique({
        where: {
          id,
        },

        include: {
          project: true,

          voies: true,

          sections: {
            include: {
              blocs: {
                include: {
                  parcelles: true,
                },
              },
            },
          },
        },
      });

    if (!terrain) {
      throw new NotFoundException(
        'Terrain introuvable',
      );
    }

    // ==========================================================
    // BLOCS
    // ==========================================================
    const blocsReels =
      (terrain.sections || []).flatMap(
        (section) => section.blocs || [],
      );

    const nombreBlocsReels =
      blocsReels.length;

    /*
     * Nous n'avons pas actuellement de champ
     * "nombreBlocs" dans Section ou Terrain.
     *
     * Le nombre réel constitue donc la référence
     * disponible pour l'instant.
     */
    const nombreBlocsDeclares =
      nombreBlocsReels;

    const ecartBlocs =
      nombreBlocsDeclares -
      nombreBlocsReels;

    // ==========================================================
    // PARCELLES
    // ==========================================================
    const toutesLesParcelles =
      blocsReels.flatMap(
        (bloc) => bloc.parcelles || [],
      );

    const nombreParcellesReelles =
      toutesLesParcelles.length;

    const nombreParcellesDeclarees =
      blocsReels.reduce(
        (total, bloc) =>
          total + bloc.nombreParcelles,
        0,
      );

    const ecartParcelles =
      nombreParcellesDeclarees -
      nombreParcellesReelles;

    const parcellesAttribuees =
      toutesLesParcelles.filter(
        (parcelle) =>
          parcelle.proprietaireId !== null,
      ).length;

    const parcellesDisponibles =
      nombreParcellesReelles -
      parcellesAttribuees;

    // ==========================================================
    // SUPERFICIE DES VOIES
    // ==========================================================
    const surfaceVoies =
      (terrain.voies || []).reduce(
        (total, voie) =>
          total + voie.superficie,
        0,
      );

    // ==========================================================
    // SUPERFICIE DES SECTIONS
    //
    // IMPORTANT :
    // La superficie d'une section concerne uniquement
    // les blocs/parcelles.
    //
    // Les voies ne sont PAS incluses dans les sections.
    // ==========================================================
    const surfaceSections =
      (terrain.sections || []).reduce(
        (total, section) =>
          total + section.superficie,
        0,
      );

    // ==========================================================
    // SUPERFICIE DES BLOCS
    // ==========================================================
    const surfaceBlocs =
      blocsReels.reduce(
        (total, bloc) =>
          total + bloc.superficie,
        0,
      );

    // ==========================================================
    // SUPERFICIE DES PARCELLES
    // ==========================================================
    const surfaceParcelles =
      toutesLesParcelles.reduce(
        (total, parcelle) =>
          total + parcelle.superficie,
        0,
      );

    // ==========================================================
    // SURFACE RESTANTE DU TERRAIN
    //
    // Terrain
    //   - voies
    //   - sections
    //
    // = surface encore disponible
    // ==========================================================
    const surfaceRestante =
      terrain.superficie -
      surfaceVoies -
      surfaceSections;

    // ==========================================================
    // SURFACE NON LOTIE
    //
    // C'est la surface du terrain qui n'est encore affectée
    // ni aux voies ni aux sections.
    // ==========================================================
    const surfaceNonLotie =
      Math.max(
        0,
        surfaceRestante,
      );

    // ==========================================================
    // ETAT DU TERRAIN
    // ==========================================================
    const etatTerrain =
      ecartBlocs === 0 &&
      ecartParcelles === 0
        ? 'COMPLET'
        : 'INCOMPLET';

    return {
      ...terrain,

      // Compatibilité avec l'ancien frontend
      blocs: blocsReels,

      statistiques: {
        // ------------------------------------------------------
        // BLOCS
        // ------------------------------------------------------
        nombreBlocsDeclares,

        nombreBlocsReels,

        ecartBlocs,

        // ------------------------------------------------------
        // PARCELLES
        // ------------------------------------------------------
        nombreParcellesDeclarees,

        nombreParcellesReelles,

        ecartParcelles,

        parcellesDisponibles,

        parcellesAttribuees,

        // ------------------------------------------------------
        // SUPERFICIE TERRAIN
        // ------------------------------------------------------
        surfaceTotaleTerrain:
          Number(
            terrain.superficie.toFixed(2),
          ),

        // ------------------------------------------------------
        // VOIES
        // ------------------------------------------------------
        surfaceVoies:
          Number(
            surfaceVoies.toFixed(2),
          ),

        nombreVoies:
          terrain.voies.length,

        // ------------------------------------------------------
        // SECTIONS
        // ------------------------------------------------------
        surfaceSections:
          Number(
            surfaceSections.toFixed(2),
          ),

        nombreSections:
          terrain.sections.length,

        // ------------------------------------------------------
        // BLOCS
        // ------------------------------------------------------
        surfaceBlocs:
          Number(
            surfaceBlocs.toFixed(2),
          ),

        // ------------------------------------------------------
        // PARCELLES
        // ------------------------------------------------------
        surfaceParcelles:
          Number(
            surfaceParcelles.toFixed(2),
          ),

        // ------------------------------------------------------
        // SURFACE RESTANTE
        // ------------------------------------------------------
        surfaceRestante:
          Number(
            surfaceRestante.toFixed(2),
          ),

        surfaceNonLotie:
          Number(
            surfaceNonLotie.toFixed(2),
          ),

        // ------------------------------------------------------
        // ETAT
        // ------------------------------------------------------
        etatTerrain,
      },
    };
  }

  // ============================================================
  // MISE A JOUR DES COORDONNEES
  // ============================================================
  async updateCoordinates(
    id: number,
    latitude: number,
    longitude: number,
  ) {
    const terrain =
      await this.prisma.terrain.findUnique({
        where: {
          id,
        },
      });

    if (!terrain) {
      throw new NotFoundException(
        'Terrain introuvable',
      );
    }

    const terrainModifie =
      await this.prisma.terrain.update({
        where: {
          id,
        },

        data: {
          localisation:
            `Lat: ${latitude}, Lng: ${longitude}`,
        },

        include: {
          project: true,
          sections: true,
          voies: true,
        },
      });

    await this.historiqueService.create(
      'MODIFICATION',
      'TERRAINS',
      `Coordonnées du terrain "${terrain.nom}" (${terrain.reference}) modifiées`,
    );

    return terrainModifie;
  }

  // ============================================================
  // MODIFICATION D'UN TERRAIN
  // ============================================================
  async update(
    id: number,
    updateTerrainDto: UpdateTerrainDto,
  ) {
    const terrain =
      await this.findOne(id);

    const terrainModifie =
      await this.prisma.terrain.update({
        where: {
          id,
        },

        data: {
          reference:
            updateTerrainDto.reference ??
            terrain.reference,

          nom:
            updateTerrainDto.nom ??
            terrain.nom,

          superficie:
            updateTerrainDto.superficie !==
            undefined
              ? Number(
                  updateTerrainDto.superficie,
                )
              : terrain.superficie,

          localisation:
            updateTerrainDto.localisation ??
            terrain.localisation,

          statut:
            updateTerrainDto.statut ??
            terrain.statut,

          projectId:
            updateTerrainDto.projectId !==
            undefined
              ? Number(
                  updateTerrainDto.projectId,
                )
              : terrain.projectId,
        },

        include: {
          project: true,
          sections: true,
          voies: true,
        },
      });

    await this.historiqueService.create(
      'MODIFICATION',
      'TERRAINS',
      `Terrain "${terrain.reference}" (${terrain.nom}) modifié`,
    );

    return terrainModifie;
  }

  // ============================================================
  // SUPPRESSION D'UN TERRAIN
  // ============================================================
  async remove(id: number) {
    const terrain =
      await this.findOne(id);

    const terrainSupprime =
      await this.prisma.terrain.delete({
        where: {
          id,
        },
      });

    await this.historiqueService.create(
      'SUPPRESSION',
      'TERRAINS',
      `Terrain "${terrain.reference}" (${terrain.nom}) supprimé`,
    );

    return terrainSupprime;
  }
}