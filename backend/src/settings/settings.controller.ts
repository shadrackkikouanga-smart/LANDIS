import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from "@nestjs/common";

import { SettingsService } from "./settings.service";


@Controller("settings")
export class SettingsController {

  constructor(
    private settingsService: SettingsService,
  ) {}


  @Get()
  async findAll() {

    return this.settingsService.findAll();

  }


  @Get(":key")
  async findByKey(
    @Param("key") key: string,
  ) {

    return this.settingsService.findByKey(
      key,
    );

  }


  @Patch(":key")
  async update(
    @Param("key") key: string,
    @Body("value") value: string,
  ) {

    return this.settingsService.update(
      key,
      value,
    );

  }

}