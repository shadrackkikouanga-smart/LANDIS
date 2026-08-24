import { Module } from '@nestjs/common';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

import { PrismaModule } from '../prisma/prisma.module';
import { HistoriqueModule } from '../historique/historique.module';

@Module({
  imports: [
    PrismaModule,
    HistoriqueModule,
  ],

  controllers: [
    DocumentsController,
  ],

  providers: [
    DocumentsService,
  ],
})
export class DocumentsModule {}