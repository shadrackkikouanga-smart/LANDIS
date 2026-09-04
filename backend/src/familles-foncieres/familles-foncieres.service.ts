import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateFamilleFonciereDto } from './dto/create-famille-fonciere.dto';
import { UpdateFamilleFonciereDto } from './dto/update-famille-fonciere.dto';

import { CreateMembreFamilleDto } from './dto/create-membre-famille.dto';
import { UpdateMembreFamilleDto } from './dto/update-membre-famille.dto';

import { CreateDroitFamilleDto } from './dto/create-droit-famille.dto';
import { UpdateDroitFamilleDto } from './dto/update-droit-famille.dto';

@Injectable()
export class FamillesFoncieresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly historiqueService: HistoriqueService,
  ) {}

  // ============================================================
  // CREATION D'UNE FAMILLE FONCIERE
  // ============================================================
  async create(
    createFamilleDto: CreateFamilleFonciereDto,
  ) {
    const terrain =
      await this.prisma.terrain.findUnique({
        where: {
          id: Number(createFamilleDto.terrainId),
        },
      });

    if (!terrain) {
      throw new NotFoundException(
        'Terrain introuvable',
      );
    }

    // ----------------------------------------------------------
    // Un terrain ne peut avoir qu'une seule famille principale
    // ----------------------------------------------------------
    if (createFamilleDto.estPrincipale) {
      const famillePrincipale =
        await this.prisma.familleFonciere.findFirst({
          where: {
            terrainId: terrain.id,
            estPrincipale: true,
          },
        });

      if (famillePrincipale) {
        throw new BadRequestException(
          'Ce terrain possède déjà une famille foncière principale',
        );
      }
    }

    const famille =
      await this.prisma.familleFonciere.create({
        data: {
          nom: createFamilleDto.nom,
          description:
            createFamilleDto.description,
          estPrincipale:
            createFamilleDto.estPrincipale ??
            false,
          active:
            createFamilleDto.active ??
            true,
          terrainId: terrain.id,
        },

        include: {
          terrain: true,
          membres: true,
          droits: true,
        },
      });

    await this.historiqueService.create(
      'CREATION',
      'FAMILLES_FONCIERES',
      `Famille foncière "${famille.nom}" créée pour le terrain "${terrain.nom}" (${terrain.reference})`,
    );

    return famille;
  }

  // ============================================================
  // LISTE DE TOUTES LES FAMILLES
  // ============================================================
  async findAll() {
    return this.prisma.familleFonciere.findMany({
      include: {
        terrain: true,

        membres: {
          orderBy: {
            nom: 'asc',
          },
        },

        droits: {
          include: {
            membre: true,
          },
        },
      },

      orderBy: [
        {
          estPrincipale: 'desc',
        },
        {
          nom: 'asc',
        },
      ],
    });
  }

  // ============================================================
  // FAMILLES D'UN TERRAIN
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

    return this.prisma.familleFonciere.findMany({
      where: {
        terrainId,
      },

      include: {
        terrain: true,

        membres: {
          orderBy: {
            nom: 'asc',
          },
        },

        droits: {
          include: {
            membre: true,
          },
        },
      },

      orderBy: [
        {
          estPrincipale: 'desc',
        },
        {
          nom: 'asc',
        },
      ],
    });
  }

  // ============================================================
  // DETAIL D'UNE FAMILLE
  // ============================================================
  async findOne(id: number) {
    const famille =
      await this.prisma.familleFonciere.findUnique({
        where: {
          id,
        },

        include: {
          terrain: true,

          membres: {
            orderBy: {
              nom: 'asc',
            },
          },

          droits: {
            include: {
              membre: true,
            },
          },
        },
      });

    if (!famille) {
      throw new NotFoundException(
        'Famille foncière introuvable',
      );
    }

    return famille;
  }

  // ============================================================
  // MODIFICATION D'UNE FAMILLE
  // ============================================================
  async update(
    id: number,
    updateFamilleDto: UpdateFamilleFonciereDto,
  ) {
    const famille =
      await this.findOne(id);

    // ----------------------------------------------------------
    // Vérification famille principale
    // ----------------------------------------------------------
    if (
      updateFamilleDto.estPrincipale ===
      true
    ) {
      const famillePrincipale =
        await this.prisma.familleFonciere.findFirst({
          where: {
            terrainId: famille.terrainId,
            estPrincipale: true,

            NOT: {
              id,
            },
          },
        });

      if (famillePrincipale) {
        throw new BadRequestException(
          'Ce terrain possède déjà une autre famille foncière principale',
        );
      }
    }

    const familleModifiee =
      await this.prisma.familleFonciere.update({
        where: {
          id,
        },

        data: {
          nom:
            updateFamilleDto.nom ??
            famille.nom,

          description:
            updateFamilleDto.description ??
            famille.description,

          estPrincipale:
            updateFamilleDto.estPrincipale ??
            famille.estPrincipale,

          active:
            updateFamilleDto.active ??
            famille.active,
        },

        include: {
          terrain: true,
          membres: true,
          droits: {
            include: {
              membre: true,
            },
          },
        },
      });

    await this.historiqueService.create(
      'MODIFICATION',
      'FAMILLES_FONCIERES',
      `Famille foncière "${famille.nom}" modifiée`,
    );

    return familleModifiee;
  }

  // ============================================================
  // SUPPRESSION D'UNE FAMILLE
  // ============================================================
  async remove(id: number) {
    const famille =
      await this.findOne(id);

    const familleSupprimee =
      await this.prisma.familleFonciere.delete({
        where: {
          id,
        },
      });

    await this.historiqueService.create(
      'SUPPRESSION',
      'FAMILLES_FONCIERES',
      `Famille foncière "${famille.nom}" supprimée du terrain ${famille.terrain.reference}`,
    );

    return familleSupprimee;
  }

  // ============================================================
  // AJOUT D'UN MEMBRE
  // ============================================================
  async createMembre(
    familleId: number,
    createMembreDto: CreateMembreFamilleDto,
  ) {
    const famille =
      await this.findOne(familleId);

    const membre =
      await this.prisma.membreFamilleFonciere.create({
        data: {
          nom: createMembreDto.nom,
          prenom: createMembreDto.prenom,
          telephone:
            createMembreDto.telephone,
          email:
            createMembreDto.email,
          adresse:
            createMembreDto.adresse,
          qualite:
            createMembreDto.qualite,
          observations:
            createMembreDto.observations,
          familleId,
        },
      });

    await this.historiqueService.create(
      'CREATION',
      'FAMILLES_FONCIERES',
      `Membre "${membre.prenom} ${membre.nom}" ajouté à la famille "${famille.nom}"`,
    );

    return membre;
  }

  // ============================================================
  // MODIFICATION D'UN MEMBRE
  // ============================================================
  async updateMembre(
    membreId: number,
    updateMembreDto: UpdateMembreFamilleDto,
  ) {
    const membre =
      await this.prisma.membreFamilleFonciere.findUnique({
        where: {
          id: membreId,
        },

        include: {
          famille: true,
        },
      });

    if (!membre) {
      throw new NotFoundException(
        'Membre de famille foncière introuvable',
      );
    }

    const membreModifie =
      await this.prisma.membreFamilleFonciere.update({
        where: {
          id: membreId,
        },

        data: {
          nom:
            updateMembreDto.nom ??
            membre.nom,

          prenom:
            updateMembreDto.prenom ??
            membre.prenom,

          telephone:
            updateMembreDto.telephone ??
            membre.telephone,

          email:
            updateMembreDto.email ??
            membre.email,

          adresse:
            updateMembreDto.adresse ??
            membre.adresse,

          qualite:
            updateMembreDto.qualite ??
            membre.qualite,

          observations:
            updateMembreDto.observations ??
            membre.observations,
        },
      });

    await this.historiqueService.create(
      'MODIFICATION',
      'FAMILLES_FONCIERES',
      `Membre "${membre.prenom} ${membre.nom}" modifié dans la famille "${membre.famille.nom}"`,
    );

    return membreModifie;
  }

  // ============================================================
  // SUPPRESSION D'UN MEMBRE
  // ============================================================
  async removeMembre(
    membreId: number,
  ) {
    const membre =
      await this.prisma.membreFamilleFonciere.findUnique({
        where: {
          id: membreId,
        },

        include: {
          famille: true,
        },
      });

    if (!membre) {
      throw new NotFoundException(
        'Membre de famille foncière introuvable',
      );
    }

    const membreSupprime =
      await this.prisma.membreFamilleFonciere.delete({
        where: {
          id: membreId,
        },
      });

    await this.historiqueService.create(
      'SUPPRESSION',
      'FAMILLES_FONCIERES',
      `Membre "${membre.prenom} ${membre.nom}" supprimé de la famille "${membre.famille.nom}"`,
    );

    return membreSupprime;
  }

  // ============================================================
  // AJOUT D'UN DROIT
  // ============================================================
  async createDroit(
    familleId: number,
    createDroitDto: CreateDroitFamilleDto,
  ) {
    const famille =
      await this.findOne(familleId);

    const membreId =
      createDroitDto.membreId;

    // ----------------------------------------------------------
    // Si un membre est précisé, il doit appartenir
    // à cette famille.
    // ----------------------------------------------------------
    if (membreId !== undefined) {
      const membre =
        await this.prisma.membreFamilleFonciere.findUnique({
          where: {
            id: membreId,
          },
        });

      if (!membre) {
        throw new NotFoundException(
          'Membre de famille foncière introuvable',
        );
      }

      if (membre.familleId !== familleId) {
        throw new BadRequestException(
          'Le membre sélectionné n’appartient pas à cette famille',
        );
      }
    }

    const droit =
      await this.prisma.droitFamilleFonciere.create({
        data: {
          type: createDroitDto.type,
          description:
            createDroitDto.description,
          familleId,
          membreId:
            membreId !== undefined
              ? membreId
              : null,
        },

        include: {
          membre: true,
          famille: true,
        },
      });

    await this.historiqueService.create(
      'CREATION',
      'FAMILLES_FONCIERES',
      `Droit "${droit.type}" ajouté à la famille "${famille.nom}"${
        membreId
          ? ` pour le membre ${droit.membre?.prenom} ${droit.membre?.nom}`
          : ''
      }`,
    );

    return droit;
  }

  // ============================================================
  // MODIFICATION D'UN DROIT
  // ============================================================
  async updateDroit(
    droitId: number,
    updateDroitDto: UpdateDroitFamilleDto,
  ) {
    const droit =
      await this.prisma.droitFamilleFonciere.findUnique({
        where: {
          id: droitId,
        },

        include: {
          famille: true,
          membre: true,
        },
      });

    if (!droit) {
      throw new NotFoundException(
        'Droit de famille foncière introuvable',
      );
    }

    const droitModifie =
      await this.prisma.droitFamilleFonciere.update({
        where: {
          id: droitId,
        },

        data: {
          type:
            updateDroitDto.type ??
            droit.type,

          actif:
            updateDroitDto.actif ??
            droit.actif,

          description:
            updateDroitDto.description ??
            droit.description,
        },

        include: {
          famille: true,
          membre: true,
        },
      });

    await this.historiqueService.create(
      'MODIFICATION',
      'FAMILLES_FONCIERES',
      `Droit "${droit.type}" de la famille "${droit.famille.nom}" modifié`,
    );

    return droitModifie;
  }

  // ============================================================
  // SUPPRESSION D'UN DROIT
  // ============================================================
  async removeDroit(
    droitId: number,
  ) {
    const droit =
      await this.prisma.droitFamilleFonciere.findUnique({
        where: {
          id: droitId,
        },

        include: {
          famille: true,
          membre: true,
        },
      });

    if (!droit) {
      throw new NotFoundException(
        'Droit de famille foncière introuvable',
      );
    }

    const droitSupprime =
      await this.prisma.droitFamilleFonciere.delete({
        where: {
          id: droitId,
        },
      });

    await this.historiqueService.create(
      'SUPPRESSION',
      'FAMILLES_FONCIERES',
      `Droit "${droit.type}" supprimé de la famille "${droit.famille.nom}"`,
    );

    return droitSupprime;
  }
}