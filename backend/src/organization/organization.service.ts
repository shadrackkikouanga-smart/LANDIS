import {
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { UpdateOrganizationDto } from './dto/update-organization.dto';


@Injectable()
export class OrganizationService {


  constructor(
    private readonly prisma: PrismaService,
  ) {}



  async findOne() {

    let organization =
      await this.prisma.organization.findFirst();



    if (!organization) {

      organization =
        await this.prisma.organization.create({

          data: {

            name: 'LANDIS',

          },

        });

    }



    return organization;

  }



  async update(
    updateOrganizationDto: UpdateOrganizationDto,
  ) {

    const organization =
      await this.findOne();



    return this.prisma.organization.update({

      where: {
        id: organization.id,
      },

      data: {
        ...updateOrganizationDto,
      },

    });

  }

}