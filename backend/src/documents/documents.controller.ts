import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';

import * as path from 'path';

import { DocumentsService } from './documents.service';

import { CreateDocumentDto } from './dto/create-document.dto';

@Controller('documents')
export class DocumentsController {

  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  @Post()
  create(
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    return this.documentsService.create(
      createDocumentDto,
    );
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get('transaction/:transactionId')
  findByTransaction(
    @Param('transactionId', ParseIntPipe)
    transactionId: number,
  ) {
    return this.documentsService.findByTransaction(
      transactionId,
    );
  }

  @Get('contrat/:transactionId/pdf')
  async genererContratVente(
    @Param('transactionId', ParseIntPipe)
    transactionId: number,
    @Res() res: Response,
  ) {

    const document =
      await this.documentsService.genererContratVente(
        transactionId,
      );

    const cheminFichier =
      path.join(
        process.cwd(),
        'documents',
        'contrats',
        document.nomFichier,
      );

    return res.download(
      cheminFichier,
      document.nomFichier,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentsService.findOne(id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.documentsService.remove(id);
  }
}