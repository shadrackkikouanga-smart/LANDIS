import {
  Module,
} from "@nestjs/common";

import {
  HistoriqueController,
} from "./historique.controller";

import {
  HistoriqueService,
} from "./historique.service";

import {
  PrismaModule,
} from "../prisma/prisma.module";


@Module({

  imports: [
    PrismaModule,
  ],

  controllers: [
    HistoriqueController,
  ],

  providers: [
    HistoriqueService,
  ],

  exports: [
    HistoriqueService,
  ],

})
export class HistoriqueModule {}