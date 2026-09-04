import { Module } from '@nestjs/common';

import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';

import { PrismaModule } from '../prisma/prisma.module';
import { HistoriqueModule } from '../historique/historique.module';

@Module({
  imports: [
    PrismaModule,
    HistoriqueModule,
  ],

  controllers: [
    SectionsController,
  ],

  providers: [
    SectionsService,
  ],

  exports: [
    SectionsService,
  ],
})
export class SectionsModule {}