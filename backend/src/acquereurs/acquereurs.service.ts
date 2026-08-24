import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { HistoriqueService } from '../historique/historique.service';

import { CreateAcquereurDto } from './dto/create-acquereur.dto';
import { UpdateAcquereurDto } from './dto/update-acquereur.dto';


@Injectable()
export class AcquereursService {

  constructor(
    private prisma: PrismaService,

    private historiqueService: HistoriqueService,
  ) {}


  async create(
    createAcquereurDto: CreateAcquereurDto,
  ) {

    const acquereur =
      await this.prisma.acquereur.create({

        data: createAcquereurDto,

      });


    await this.historiqueService.create(
      'CREATION',
      'ACQUEREURS',
      `Acquéreur "${acquereur.nom} ${acquereur.prenom}" créé`,
    );


    return acquereur;

  }


  async findAll() {

    return this.prisma.acquereur.findMany({

      include: {

        transactions: {

          include: {

            parcelle: true,

          },

        },

      },

    });

  }


  async findOne(
    id: number,
  ) {

    const acquereur =
      await this.prisma.acquereur.findUnique({

        where: {

          id,

        },

        include: {

          transactions: {

            include: {

              parcelle: true,

            },

          },

        },

      });


    if (!acquereur) {

      throw new NotFoundException(
        'Acquéreur introuvable',
      );

    }


    return acquereur;

  }


  async update(
    id: number,

    updateAcquereurDto:
      UpdateAcquereurDto,
  ) {

    const acquereur =
      await this.findOne(id);


    const acquereurModifie =
      await this.prisma.acquereur.update({

        where: {

          id,

        },

        data:
          updateAcquereurDto,

      });


    await this.historiqueService.create(
      'MODIFICATION',
      'ACQUEREURS',
      `Acquéreur "${acquereur.nom} ${acquereur.prenom}" modifié`,
    );


    return acquereurModifie;

  }


  async remove(
    id: number,
  ) {

    const acquereur =
      await this.findOne(id);


    const acquereurSupprime =
      await this.prisma.acquereur.delete({

        where: {

          id,

        },

      });


    await this.historiqueService.create(
      'SUPPRESSION',
      'ACQUEREURS',
      `Acquéreur "${acquereur.nom} ${acquereur.prenom}" supprimé`,
    );


    return acquereurSupprime;

  }

}