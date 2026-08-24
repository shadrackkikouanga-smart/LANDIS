import { Test, TestingModule } from '@nestjs/testing';
import { BlocsService } from './blocs.service';

describe('BlocsService', () => {
  let service: BlocsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlocsService],
    }).compile();

    service = module.get<BlocsService>(BlocsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
