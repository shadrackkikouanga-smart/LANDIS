import { Module } from '@nestjs/common';

import { AcquereursController } from './acquereurs.controller';
import { AcquereursService } from './acquereurs.service';

import { PrismaModule } from '../prisma/prisma.module';
import { HistoriqueModule } from '../historique/historique.module';


@Module({

  imports: [

    PrismaModule,

    HistoriqueModule,

  ],

  controllers: [

    AcquereursController,

  ],

  providers: [

    AcquereursService,

  ],

})
export class AcquereursModule {}