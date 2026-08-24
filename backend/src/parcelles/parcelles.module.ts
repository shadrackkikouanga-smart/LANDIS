import { Module } from '@nestjs/common';

import { ParcellesController } from './parcelles.controller';
import { ParcellesService } from './parcelles.service';

import { HistoriqueModule } from '../historique/historique.module';


@Module({
  imports: [
    HistoriqueModule,
  ],

  controllers: [
    ParcellesController,
  ],

  providers: [
    ParcellesService,
  ],
})
export class ParcellesModule {}