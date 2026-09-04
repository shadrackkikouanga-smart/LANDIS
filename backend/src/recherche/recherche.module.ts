import {
  Module,
} from '@nestjs/common';

import {
  RechercheController,
} from './recherche.controller';

import {
  RechercheService,
} from './recherche.service';

import {
  PrismaModule,
} from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    RechercheController,
  ],

  providers: [
    RechercheService,
  ],

  exports: [
    RechercheService,
  ],
})
export class RechercheModule {}