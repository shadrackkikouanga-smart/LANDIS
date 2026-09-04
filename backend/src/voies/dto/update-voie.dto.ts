import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PositionVoie,
  TypeVoie,
} from '@prisma/client';

export class UpdateBlocVoieDto {
  @IsInt()
  @Min(1)
  blocId!: number;

  @IsEnum(PositionVoie)
  position!: PositionVoie;
}

export class UpdateVoieDto {
  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsEnum(TypeVoie)
  type?: TypeVoie;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  largeur?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  longueur?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBlocVoieDto)
  blocs?: UpdateBlocVoieDto[];
}