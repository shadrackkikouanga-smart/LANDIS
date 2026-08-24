import { Test, TestingModule } from '@nestjs/testing';
import { AcquereursController } from './acquereurs.controller';

describe('AcquereursController', () => {
  let controller: AcquereursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcquereursController],
    }).compile();

    controller = module.get<AcquereursController>(AcquereursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
