import {
  Controller,
  Get,
  Query,
  Post,
} from "@nestjs/common";

import { HistoriqueService } from "./historique.service";


@Controller("settings/history")
export class HistoriqueController {

  constructor(
    private historiqueService: HistoriqueService,
  ) {}


   @Post("test")
async test() {
  return this.historiqueService.create(
    "TEST",
    "SYSTEME",
    "Test du système d'historique",
  );
}

  @Get()
  async findAll() {

    return this.historiqueService.findAll();

  }

 


  @Get("recent")
  async findRecent(
    @Query("limit") limit?: string,
  ) {

    const nombre =
      limit
        ? Number(limit)
        : 20;

    return this.historiqueService.findRecent(
      nombre,
    );

  }

}