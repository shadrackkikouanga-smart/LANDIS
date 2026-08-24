import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';


@Injectable()
export class ProprietairesService {

  constructor(
    private prisma: PrismaService,

    private historiqueService: HistoriqueService,
  ) {}


  async create(
    createProprietaireDto: CreateProprietaireDto,
  ) {

    const proprietaire =
      await this.prisma.proprietaire.create({

        data:
          createProprietaireDto,

      });


    await this.historiqueService.create(
      'CREATION',
      'PROPRIETAIRES',
      `Propriétaire "${proprietaire.nom} ${proprietaire.prenom}" créé`,
    );


    return proprietaire;

  }


  async findAll() {

    return this.prisma.proprietaire.findMany({

      include: {

        parcelles: true,

      },

    });

  }


  async findOne(
    id: number,
  ) {

    const proprietaire =
      await this.prisma.proprietaire.findUnique({

        where: {

          id,

        },

        include: {

          parcelles: true,

        },

      });


    if (!proprietaire) {

      throw new NotFoundException(
        'Propriétaire introuvable',
      );

    }


    return proprietaire;

  }


  async update(
    id: number,

    updateProprietaireDto:
      UpdateProprietaireDto,
  ) {

    const proprietaire =
      await this.findOne(id);


    const proprietaireModifie =
      await this.prisma.proprietaire.update({

        where: {

          id,

        },

        data:
          updateProprietaireDto,

      });


    await this.historiqueService.create(
      'MODIFICATION',
      'PROPRIETAIRES',
      `Propriétaire "${proprietaire.nom} ${proprietaire.prenom}" modifié`,
    );


    return proprietaireModifie;

  }


  async remove(
    id: number,
  ) {

    const proprietaire =
      await this.findOne(id);


    if (
      proprietaire.parcelles.length > 0
    ) {

      throw new Error(
        'Impossible de supprimer un propriétaire qui possède des parcelles attribuées.',
      );

    }


    const proprietaireSupprime =
      await this.prisma.proprietaire.delete({

        where: {

          id,

        },

      });


    await this.historiqueService.create(
      'SUPPRESSION',
      'PROPRIETAIRES',
      `Propriétaire "${proprietaire.nom} ${proprietaire.prenom}" supprimé`,
    );


    return proprietaireSupprime;

  }

}