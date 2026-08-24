import {
  Injectable,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";


@Injectable()
export class HistoriqueService {

  constructor(
    private prisma: PrismaService,
  ) {}


  async create(
    action: string,
    module: string,
    description: string,
    userId?: number,
  ) {

    return this.prisma.historique.create({

      data: {

        action,

        module,

        description,

        ...(userId !== undefined
          ? {
              User: {
                connect: {
                  id: userId,
                },
              },
            }
          : {}),

      },

    });

  }


  async findAll() {

    return this.prisma.historique.findMany({

      orderBy: {

        createdAt: "desc",

      },

      include: {

        User: {

          select: {

            id: true,

            name: true,

            email: true,

            role: true,

          },

        },

      },

    });

  }


  async findRecent(
    limit = 20,
  ) {

    return this.prisma.historique.findMany({

      take: limit,

      orderBy: {

        createdAt: "desc",

      },

      include: {

        User: {

          select: {

            id: true,

            name: true,

            role: true,

          },

        },

      },

    });

  }

}