import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSectionDto {
  @IsString()
  reference!: string;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsNumber()
  @Min(0.01)
  superficie!: number;

  @IsInt()
  @Min(1)
  terrainId!: number;
}