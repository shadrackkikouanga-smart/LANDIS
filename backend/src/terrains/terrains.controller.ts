import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { TerrainsService } from './terrains.service';

import { CreateTerrainDto } from './dto/create-terrain.dto';
import { UpdateTerrainDto } from './dto/update-terrain.dto';

@Controller('terrains')
export class TerrainsController {
  constructor(
    private readonly terrainsService: TerrainsService,
  ) {}

  @Post()
  create(
    @Body() createTerrainDto: CreateTerrainDto,
  ) {
    return this.terrainsService.create(
      createTerrainDto,
    );
  }

  @Get()
  findAll() {
    return this.terrainsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.terrainsService.findOne(
      Number(id),
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
    return this.terrainsService.updateCoordinates(
      Number(id),
      body.latitude,
      body.longitude,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTerrainDto: UpdateTerrainDto,
  ) {
    return this.terrainsService.update(
      Number(id),
      updateTerrainDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.terrainsService.remove(
      Number(id),
    );
  }
}