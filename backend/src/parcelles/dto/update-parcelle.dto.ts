import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
} from 'class-validator';

export class UpdateParcelleDto {
  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsNumber()
  superficie?: number;

  @IsOptional()
  @IsInt()
  blocId?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}