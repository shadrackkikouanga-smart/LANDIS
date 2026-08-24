import { Module } from '@nestjs/common';

import { PaiementsController } from './paiements.controller';
import { PaiementsService } from './paiements.service';

import { PrismaModule } from '../prisma/prisma.module';
import { HistoriqueModule } from '../historique/historique.module';


@Module({

  imports: [

    PrismaModule,

    HistoriqueModule,

  ],

  controllers: [

    PaiementsController,

  ],

  providers: [

    PaiementsService,

  ],

})
export class PaiementsModule {}