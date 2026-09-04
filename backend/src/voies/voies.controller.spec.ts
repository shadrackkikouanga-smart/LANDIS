import { Test, TestingModule } from '@nestjs/testing';
import { VoiesController } from './voies.controller';

describe('VoiesController', () => {
  let controller: VoiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiesController],
    }).compile();

    controller = module.get<VoiesController>(VoiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
