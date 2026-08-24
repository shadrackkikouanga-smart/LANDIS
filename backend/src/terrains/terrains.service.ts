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

  async create(
    createTerrainDto: CreateTerrainDto,
  ) {
    const terrain =
      await this.prisma.terrain.create({
        data: createTerrainDto,

        include: {
          project: true,
          blocs: true,
        },
      });

    await this.historiqueService.create(
      'CREATION',
      'TERRAINS',
      `Terrain "${terrain.nom}" (${terrain.reference}) créé`,
    );

    return terrain;
  }

  async findAll() {
    return this.prisma.terrain.findMany({
      include: {
        project: true,
        blocs: true,
      },
    });
  }

  async findOne(
    id: number,
  ) {
    const terrain =
      await this.prisma.terrain.findUnique({
        where: {
          id,
        },

        include: {
          project: true,

          blocs: {
            include: {
              parcelles: true,
            },
          },
        },
      });

    if (!terrain) {
      throw new NotFoundException(
        'Terrain introuvable',
      );
    }

    // ============================
    // Statistiques des blocs
    // ============================

    const nombreBlocsReels =
      terrain.blocs.length;

    const nombreBlocsDeclares =
      nombreBlocsReels;

    const ecartBlocs =
      nombreBlocsDeclares -
      nombreBlocsReels;

    // ============================
    // Statistiques des parcelles
    // ============================

    const toutesLesParcelles =
      terrain.blocs.flatMap(
        (bloc) => bloc.parcelles,
      );

    const nombreParcellesReelles =
      toutesLesParcelles.length;

    const nombreParcellesDeclarees =
      terrain.blocs.reduce(
        (total, bloc) =>
          total + bloc.nombreParcelles,
        0,
      );

    const ecartParcelles =
      nombreParcellesDeclarees -
      nombreParcellesReelles;

    const parcellesAttribuees =
      toutesLesParcelles.filter(
        (p) =>
          p.proprietaireId !== null,
      ).length;

    const parcellesDisponibles =
      nombreParcellesReelles -
      parcellesAttribuees;

    // ============================
    // Etat du terrain
    // ============================

    const etatTerrain =
      ecartBlocs === 0 &&
      ecartParcelles === 0
        ? 'COMPLET'
        : 'INCOMPLET';

    // ============================
    // Surfaces
    // ============================

    const surfaceLotie =
      terrain.blocs.reduce(
        (total, bloc) =>
          total + bloc.superficie,
        0,
      );

    const surfaceRestante =
      terrain.superficie -
      surfaceLotie;

    return {
      ...terrain,

      statistiques: {
        nombreBlocsDeclares,

        nombreBlocsReels,

        ecartBlocs,

        etatTerrain,

        nombreParcellesDeclarees,

        nombreParcellesReelles,

        ecartParcelles,

        parcellesDisponibles,

        parcellesAttribuees,

        surfaceTotaleTerrain:
          terrain.superficie,

        surfaceLotie,

        surfaceRestante,
      },
    };
  }

  // ========================================
  // Mise à jour des coordonnées géographiques
  // ========================================

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
          latitude,
          longitude,
        },

        include: {
          project: true,
          blocs: true,
        },
      });

    await this.historiqueService.create(
      'MODIFICATION',
      'TERRAINS',
      `Coordonnées du terrain "${terrain.nom}" (${terrain.reference}) modifiées`,
    );

    return terrainModifie;
  }

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

        data: updateTerrainDto,

        include: {
          project: true,
          blocs: true,
        },
      });

    await this.historiqueService.create(
      'MODIFICATION',
      'TERRAINS',
      `Terrain "${terrain.reference}" (${terrain.nom}) modifié`,
    );

    return terrainModifie;
  }

  async remove(
    id: number,
  ) {
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