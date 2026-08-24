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

  async findAll() {
    return this.prisma.parcelle.findMany({
      include: {
        bloc: true,
        proprietaire: true,
      },
    });
  }

  async findOne(
    id: number,
  ) {
    const parcelle =
      await this.prisma.parcelle.findUnique({
        where: {
          id,
        },

        include: {
          bloc: true,
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

  async update(
    id: number,
    updateParcelleDto: UpdateParcelleDto,
  ) {
    const parcelle =
      await this.findOne(id);

    const parcelleModifiee =
      await this.prisma.parcelle.update({
        where: {
          id,
        },

        data: updateParcelleDto,

        include: {
          bloc: true,
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
          bloc: true,
        },
      });

    await this.historiqueService.create(
      'ATTRIBUTION',
      'PARCELLES',
      `Parcelle "${parcelle.reference}" attribuée à ${proprietaire.nom} ${proprietaire.prenom}`,
    );

    return parcelleAttribuee;
  }

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
        bloc: true,
        proprietaire: true,
      },
    });
  }
}