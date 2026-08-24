import { Test, TestingModule } from '@nestjs/testing';
import { ProprietairesController } from './proprietaires.controller';

describe('ProprietairesController', () => {
  let controller: ProprietairesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProprietairesController],
    }).compile();

    controller = module.get<ProprietairesController>(ProprietairesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
