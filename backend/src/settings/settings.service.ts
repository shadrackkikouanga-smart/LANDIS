import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";


@Injectable()
export class SettingsService {

  constructor(
    private prisma: PrismaService,
  ) {}


  async findAll() {

    return this.prisma.setting.findMany({

      orderBy: {
        key: "asc",
      },

    });

  }


  async findByKey(
    key: string,
  ) {

    const setting =
      await this.prisma.setting.findUnique({

        where: {
          key,
        },

      });


    if (!setting) {

      throw new NotFoundException(
        "Paramètre introuvable",
      );

    }


    return setting;

  }


  async update(
    key: string,
    value: string,
  ) {

    return this.prisma.setting.upsert({

      where: {
        key,
      },

      update: {
        value,
      },

      create: {
        key,
        value,
      },

    });

  }

}