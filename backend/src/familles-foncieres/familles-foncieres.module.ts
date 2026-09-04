import { Module } from '@nestjs/common';

import { FamillesFoncieresController } from './familles-foncieres.controller';
import { FamillesFoncieresService } from './familles-foncieres.service';

import { PrismaModule } from '../prisma/prisma.module';
import { HistoriqueModule } from '../historique/historique.module';

@Module({
  imports: [
    PrismaModule,
    HistoriqueModule,
  ],

  controllers: [
    FamillesFoncieresController,
  ],

  providers: [
    FamillesFoncieresService,
  ],

  exports: [
    FamillesFoncieresService,
  ],
})
export class FamillesFoncieresModule {}