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

export class BlocVoieDto {
  @IsInt()
  @Min(1)
  blocId!: number;

  @IsEnum(PositionVoie)
  position!: PositionVoie;
}

export class CreateVoieDto {
  @IsString()
  reference!: string;

  @IsEnum(TypeVoie)
  type!: TypeVoie;

  @IsNumber()
  @Min(0.01)
  largeur!: number;

  @IsNumber()
  @Min(0.01)
  longueur!: number;

  @IsInt()
  @Min(1)
  terrainId!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlocVoieDto)
  blocs?: BlocVoieDto[];
}