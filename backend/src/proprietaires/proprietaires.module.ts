import { Module } from '@nestjs/common';

import { ProprietairesController } from './proprietaires.controller';
import { ProprietairesService } from './proprietaires.service';

import { PrismaModule } from '../prisma/prisma.module';
import { HistoriqueModule } from '../historique/historique.module';


@Module({

  imports: [

    PrismaModule,

    HistoriqueModule,

  ],

  controllers: [

    ProprietairesController,

  ],

  providers: [

    ProprietairesService,

  ],

})

export class ProprietairesModule {}