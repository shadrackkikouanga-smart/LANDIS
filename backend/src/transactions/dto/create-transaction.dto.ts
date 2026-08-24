import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';

import {
  TypeTransaction,
} from '@prisma/client';


export class CreateTransactionDto {

  @IsInt()
  parcelleId: number;


  @IsInt()
  acquereurId: number;


  @IsEnum(TypeTransaction)
  type: TypeTransaction;


  @IsOptional()
  @IsNumber()
  prix?: number;

}