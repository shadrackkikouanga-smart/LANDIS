import {
  PartialType,
} from '@nestjs/mapped-types';

import {
  CreateTransactionDto,
} from './create-transaction.dto';


import {
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';


import {
  StatutTransaction,
} from '@prisma/client';



export class UpdateTransactionDto
  extends PartialType(CreateTransactionDto) {


  @IsOptional()
  @IsEnum(StatutTransaction)
  statut?: StatutTransaction;



  @IsOptional()
  @IsNumber()
  prix?: number;

}