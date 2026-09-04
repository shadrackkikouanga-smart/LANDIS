import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { ParcellesService } from './parcelles.service';
import { CreateParcelleDto } from './dto/create-parcelle.dto';
import { UpdateParcelleDto } from './dto/update-parcelle.dto';

@ApiTags('Parcelles')
@Controller('parcelles')
export class ParcellesController {
  constructor(
    private readonly parcellesService: ParcellesService,
  ) {}

  @Post()
  create(
    @Body()
    createParcelleDto: CreateParcelleDto,
  ) {
    return this.parcellesService.create(
      createParcelleDto,
    );
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.parcellesService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.parcellesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    updateParcelleDto: UpdateParcelleDto,
  ) {
    return this.parcellesService.update(
      id,
      updateParcelleDto,
    );
  }

  @Patch(':parcelleId/attribuer/:proprietaireId')
  attribuer(
    @Param('parcelleId', ParseIntPipe)
    parcelleId: number,

    @Param('proprietaireId', ParseIntPipe)
    proprietaireId: number,
  ) {
    return this.parcellesService.attribuer(
      parcelleId,
      proprietaireId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.parcellesService.remove(id);
  }

  @Patch(':id/coordinates')
  updateCoordinates(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    body: {
      latitude: number;
      longitude: number;
    },
  ) {
    return this.parcellesService.updateCoordinates(
      id,
      body.latitude,
      body.longitude,
    );
  }
}