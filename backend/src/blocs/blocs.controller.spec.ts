import { Test, TestingModule } from '@nestjs/testing';
import { BlocsController } from './blocs.controller';

describe('BlocsController', () => {
  let controller: BlocsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlocsController],
    }).compile();

    controller = module.get<BlocsController>(BlocsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
