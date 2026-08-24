import { Module } from '@nestjs/common';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

import { PrismaModule } from '../prisma/prisma.module';
import { HistoriqueModule } from '../historique/historique.module';


@Module({

  imports: [

    PrismaModule,

    HistoriqueModule,

  ],

  controllers: [

    TransactionsController,

  ],

  providers: [

    TransactionsService,

  ],

})
export class TransactionsModule {}