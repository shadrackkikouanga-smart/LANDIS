import {
  Body,
  Controller,
  Get,
  Patch,
} from '@nestjs/common';

import { OrganizationService } from './organization.service';

import { UpdateOrganizationDto } from './dto/update-organization.dto';


@Controller('organization')
export class OrganizationController {


  constructor(
    private readonly organizationService: OrganizationService,
  ) {}



  @Get()
  async findOne() {

    return this.organizationService.findOne();

  }



  @Patch()
  async update(
    @Body()
    updateOrganizationDto: UpdateOrganizationDto,
  ) {

    return this.organizationService.update(
      updateOrganizationDto,
    );

  }

}