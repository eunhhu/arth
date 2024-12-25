import { Test, TestingModule } from '@nestjs/testing';
import { CloudController } from './cloud.controller';
import { CloudService } from './cloud.service';

describe('CloudController', () => {
  let cloudController: CloudController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CloudController],
      providers: [CloudService],
    }).compile();

    cloudController = app.get<CloudController>(CloudController);
  });

  describe('root', () => {
    // it('should return "Hello World!"', () => {
    //   expect(CloudController.getHello()).toBe('Hello World!');
    // });
  });
});
