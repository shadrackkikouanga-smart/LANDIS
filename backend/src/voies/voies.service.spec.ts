import { Test, TestingModule } from '@nestjs/testing';
import { VoiesService } from './voies.service';

describe('VoiesService', () => {
  let service: VoiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoiesService],
    }).compile();

    service = module.get<VoiesService>(VoiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
