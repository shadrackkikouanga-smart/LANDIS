import { Module } from '@nestjs/common';

import { VoiesController } from './voies.controller';
import { VoiesService } from './voies.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HistoriqueModule } from '../historique/historique.module';

@Module({
  imports: [
    PrismaModule,
    HistoriqueModule,
  ],
  controllers: [
    VoiesController,
  ],
  providers: [
    VoiesService,
  ],
  exports: [
    VoiesService,
  ],
})
export class VoiesModule {}