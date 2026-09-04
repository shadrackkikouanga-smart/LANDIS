import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
    @Body()
    updateBlocDto: UpdateBlocDto,
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

  @Patch(
    ':id/ajouter-parcelles/:nombre',
  )
  ajouterParcelles(
    @Param('id') id: string,
    @Param('nombre') nombre: string,
  ) {
    return this.blocsService.ajouterParcelles(
      Number(id),
      {
        quantite: Number(nombre),
      },
    );
  }

  @Patch(
    ':id/reduire-parcelles/:nombre',
  )
  reduireParcelles(
    @Param('id') id: string,
    @Param('nombre') nombre: string,
  ) {
    return this.blocsService.reduireParcelles(
      Number(id),
      {
        quantite: Number(nombre),
      },
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
      {
        latitude: body.latitude,
        longitude: body.longitude,
      },
    );
  }
}