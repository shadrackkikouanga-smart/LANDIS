import { Test, TestingModule } from '@nestjs/testing';

import { AcquereursService } from './acquereurs.service';


describe('AcquereursService', () => {

  let service: AcquereursService;


  beforeEach(async () => {

    const module: TestingModule =
      await Test.createTestingModule({

        providers: [
          AcquereursService,
        ],

      }).compile();


    service = module.get<AcquereursService>(
      AcquereursService,
    );

  });


  it('should be defined', () => {

    expect(service).toBeDefined();

  });

});