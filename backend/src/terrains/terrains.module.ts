import { Module } from '@nestjs/common';

import { TerrainsController } from './terrains.controller';
import { TerrainsService } from './terrains.service';

import { HistoriqueModule } from '../historique/historique.module';


@Module({
  imports: [
    HistoriqueModule,
  ],

  controllers: [
    TerrainsController,
  ],

  providers: [
    TerrainsService,
  ],
})
export class TerrainsModule {}