import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { ParcellesModule } from './parcelles/parcelles.module';
import { ProprietairesModule } from './proprietaires/proprietaires.module';
import { AcquereursModule } from './acquereurs/acquereurs.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaiementsModule } from './paiements/paiements.module';
import { DocumentsModule } from './documents/documents.module';
import { TerrainsModule } from './terrains/terrains.module';
import { BlocsModule } from './blocs/blocs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { OrganizationModule } from './organization/organization.module';
import { HistoriqueModule } from './historique/historique.module';
import { SectionsModule } from './sections/sections.module';
import { VoiesModule } from './voies/voies.module';
import { FamillesFoncieresModule } from './familles-foncieres/familles-foncieres.module';
import { RecensementsModule } from './recensements/recensements.module';
import { RechercheModule } from './recherche/recherche.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    UsersModule,

    PrismaModule,

    AuthModule,

    ProjectsModule,

    ParcellesModule,

    ProprietairesModule,

    AcquereursModule,

    TransactionsModule,

    PaiementsModule,

    DocumentsModule,

    TerrainsModule,

    BlocsModule,

    DashboardModule,

    SettingsModule,

    OrganizationModule,

    HistoriqueModule,

    SectionsModule,

    VoiesModule,

    FamillesFoncieresModule,

    RecensementsModule,

    RechercheModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}