import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { BlocsService } from './blocs.service';

import { CreateBlocDto } from './dto/create-bloc.dto';
import { UpdateBlocDto } from './dto/update-bloc.dto';

@Controller('blocs')
export class BlocsController {
  constructor(
    private readonly blocsService: BlocsService,
  ) {}



  @Post()
  create(
    @Body() createBlocDto: CreateBlocDto,
  ) {
    return this.blocsService.create(
      createBlocDto,
    );
  }



  // Création d'un bloc avec génération automatique des parcelles
  @Post('complet')
  createBlocComplet(
    @Body() createBlocDto: CreateBlocDto,
  ) {
    return this.blocsService.createBlocComplet(
      createBlocDto,
    );
  }



  @Get()
  findAll() {
    return this.blocsService.findAll();
  }



  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.blocsService.findOne(
      Number(id),
    );
  }



  @Get(':id/statistiques')
  statistiques(
    @Param('id') id: string,
  ) {
    return this.blocsService.statistiques(
      Number(id),
    );
  }



  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBlocDto: UpdateBlocDto,
  ) {
    return this.blocsService.update(
      Number(id),
      updateBlocDto,
    );
  }



  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.blocsService.remove(
      Number(id),
    );
  }



  @Patch(':id/ajouter-parcelles/:nombre')
  ajouterParcelles(
    @Param('id') id: string,
    @Param('nombre') nombre: string,
  ) {
    return this.blocsService.ajouterParcelles(
      Number(id),
      Number(nombre),
    );
  }



  @Patch(':id/reduire-parcelles/:nombre')
  reduireParcelles(
    @Param('id') id: string,
    @Param('nombre') nombre: string,
  ) {
    return this.blocsService.reduireParcelles(
      Number(id),
      Number(nombre),
    );
  }

  @Patch(':id/coordinates')
updateCoordinates(
  @Param('id') id: string,
  @Body()
  body: {
    latitude: number;
    longitude: number;
  },
) {
  return this.blocsService.updateCoordinates(
    Number(id),
    body.latitude,
    body.longitude,
  );
}
}