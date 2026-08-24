import { PartialType } from '@nestjs/mapped-types';

import { CreateAcquereurDto } from './create-acquereur.dto';


export class UpdateAcquereurDto extends PartialType(
  CreateAcquereurDto,
) {}