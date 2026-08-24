import { IsInt, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePaiementDto {

  @IsInt()
  transactionId!: number;

  @IsNumber()
  montant!: number;

  @IsString()
  modePaiement!: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
}