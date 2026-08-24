import { Module } from '@nestjs/common';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

import { HistoriqueModule } from '../historique/historique.module';


@Module({
  imports: [
    HistoriqueModule,
  ],

  controllers: [
    ProjectsController,
  ],

  providers: [
    ProjectsService,
  ],
})
export class ProjectsModule {}