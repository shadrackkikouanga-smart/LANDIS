import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';

import { PaiementsService } from './paiements.service';

import { CreatePaiementDto } from './dto/create-paiement.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';


@Controller('paiements')
export class PaiementsController {

  constructor(
    private readonly paiementsService: PaiementsService,
  ) {}



  @Post()
  create(
    @Body() createPaiementDto: CreatePaiementDto,
  ) {
    return this.paiementsService.create(
      createPaiementDto,
    );
  }




  @Get()
  findAll() {
    return this.paiementsService.findAll();
  }




  @Get('transaction/:transactionId')
  findByTransaction(
    @Param('transactionId', ParseIntPipe) transactionId: number,
  ) {
    return this.paiementsService.findByTransaction(
      transactionId,
    );
  }




  @Get(':id/pdf')
  generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    return this.paiementsService.generatePdf(
      id,
      res,
    );
  }




  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paiementsService.findOne(id);
  }




  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaiementDto: UpdatePaiementDto,
  ) {
    return this.paiementsService.update(
      id,
      updatePaiementDto,
    );
  }




  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paiementsService.remove(id);
  }

}