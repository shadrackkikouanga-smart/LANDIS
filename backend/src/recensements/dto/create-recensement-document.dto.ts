import {
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecensementDocumentDto {
  @IsString()
  typeDocument!: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsDateString()
  dateDocument?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}