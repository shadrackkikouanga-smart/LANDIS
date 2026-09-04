import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  superficie?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  terrainId?: number;
}