import { Module } from '@nestjs/common';

import { RecensementsController } from './recensements.controller';

import { RecensementsService } from './recensements.service';

import { ComparaisonRecensementService } from './comparaison/comparaison-recensement.service';

import { RecensementRapportsController } from './rapports/recensement-rapports.controller';

import { RecensementRapportsService } from './rapports/recensement-rapports.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],

  controllers: [
    RecensementsController,
    RecensementRapportsController,
  ],

  providers: [
    RecensementsService,
    ComparaisonRecensementService,
    RecensementRapportsService,
  ],

  exports: [
    RecensementsService,
    ComparaisonRecensementService,
    RecensementRapportsService,
  ],
})
export class RecensementsModule {}