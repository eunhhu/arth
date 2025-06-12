import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  const mockPin = '1234';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: 'PIN',
          useValue: mockPin,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkPin', () => {
    it('should return "success" when pin matches', () => {
      expect(service.checkPin(mockPin)).toBe('success');
    });

    it('should return "fail" when pin does not match', () => {
      expect(service.checkPin('wrongpin')).toBe('fail');
    });

    it('should return "fail" when pin is null', () => {
      expect(service.checkPin(null)).toBe('fail');
    });

    it('should return "fail" when pin is undefined', () => {
      expect(service.checkPin(undefined)).toBe('fail');
    });
  });
});
