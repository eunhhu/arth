import { Test, TestingModule } from '@nestjs/testing';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

describe('SystemController', () => {
  let systemController: SystemController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SystemController],
      providers: [SystemService],
    }).compile();

    systemController = app.get<SystemController>(SystemController);
  });

  describe('root', () => {
    // it('should return "Hello World!"', () => {
    //   expect(SystemController.getHello()).toBe('Hello World!');
    // });
  });
});
