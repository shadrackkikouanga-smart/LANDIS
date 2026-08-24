import { Module } from '@nestjs/common';

import { BlocsController } from './blocs.controller';
import { BlocsService } from './blocs.service';

import { HistoriqueModule } from '../historique/historique.module';


@Module({
  imports: [
    HistoriqueModule,
  ],

  controllers: [
    BlocsController,
  ],

  providers: [
    BlocsService,
  ],
})
export class BlocsModule {}