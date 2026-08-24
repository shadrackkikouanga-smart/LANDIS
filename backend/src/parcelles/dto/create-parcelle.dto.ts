import {
  IsString,
  IsNumber,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateParcelleDto {
  @IsString()
  @IsNotEmpty()
  reference!: string;

  @IsString()
  @IsNotEmpty()
  numero!: string;

  @IsNumber()
  superficie!: number;

  @IsInt()
  blocId!: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}