import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';


export class CreateBlocDto {

  @IsString()
  @IsNotEmpty()
  reference!: string;


  @IsNumber()
  superficie!: number;


  @IsInt()
  nombreParcelles!: number;


  @IsInt()
  terrainId!: number;

}