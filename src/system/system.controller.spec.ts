import { Test, TestingModule } from '@nestjs/testing';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

// Mock SystemService
const mockSystemService = {
  getOSInfo: jest.fn(),
  getCPU: jest.fn(),
  getMemory: jest.fn(),
  getBattery: jest.fn(),
  getStorage: jest.fn(),
};

describe('SystemController', () => {
  let controller: SystemController;
  let service: SystemService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemController],
      providers: [
        {
          provide: SystemService,
          useValue: mockSystemService,
        },
      ],
    }).compile();

    controller = module.get<SystemController>(SystemController);
    service = module.get<SystemService>(SystemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test cases for each method
  describe('os', () => {
    it('should call systemService.getOSInfo and return its result', async () => {
      const mockResult = { hostname: 'test-host' };
      mockSystemService.getOSInfo.mockResolvedValue(mockResult); // Assuming getOSInfo might be async or return promise-like

      const result = await controller.os();
      expect(mockSystemService.getOSInfo).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should return a rejected promise if systemService.getOSInfo throws', async () => {
      const errorMessage = 'OS info error';
      mockSystemService.getOSInfo.mockImplementation(() => { // Use mockImplementation for direct throw or promise reject
        throw new Error(errorMessage);
      });

      await expect(controller.os()).rejects.toEqual({ error: errorMessage });
      expect(mockSystemService.getOSInfo).toHaveBeenCalled();
    });
  });

  describe('cpu', () => {
    it('should call systemService.getCPU and return its result', async () => {
      const mockResult = { cores: [], usage: 0 };
      mockSystemService.getCPU.mockResolvedValue(mockResult);

      const result = await controller.cpu();
      expect(mockSystemService.getCPU).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should return a rejected promise if systemService.getCPU throws', async () => {
      const errorMessage = 'CPU info error';
      mockSystemService.getCPU.mockRejectedValue(new Error(errorMessage));

      await expect(controller.cpu()).rejects.toEqual({ error: errorMessage });
      expect(mockSystemService.getCPU).toHaveBeenCalled();
    });
  });

  describe('memory', () => {
    it('should call systemService.getMemory and return its result', async () => {
      const mockResult = { total: 1000, free: 500 };
      mockSystemService.getMemory.mockResolvedValue(mockResult);

      const result = await controller.memory();
      expect(mockSystemService.getMemory).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should return a rejected promise if systemService.getMemory throws', async () => {
      const errorMessage = 'Memory info error';
      mockSystemService.getMemory.mockRejectedValue(new Error(errorMessage));

      await expect(controller.memory()).rejects.toEqual({ error: errorMessage });
      expect(mockSystemService.getMemory).toHaveBeenCalled();
    });
  });

  describe('battery', () => {
    it('should call systemService.getBattery and return its result', async () => {
      const mockResult = { level: 90, charging: false };
      mockSystemService.getBattery.mockResolvedValue(mockResult);

      const result = await controller.battery();
      expect(mockSystemService.getBattery).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should return a rejected promise if systemService.getBattery throws', async () => {
      const errorMessage = 'Battery info error';
      mockSystemService.getBattery.mockRejectedValue(new Error(errorMessage));

      await expect(controller.battery()).rejects.toEqual({ error: errorMessage });
      expect(mockSystemService.getBattery).toHaveBeenCalled();
    });
  });

  describe('storage', () => {
    it('should call systemService.getStorage and return its result', async () => {
      const mockResult = { root: {}, data: {} };
      mockSystemService.getStorage.mockResolvedValue(mockResult);

      const result = await controller.storage();
      expect(mockSystemService.getStorage).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should return a rejected promise if systemService.getStorage throws', async () => {
      const errorMessage = 'Storage info error';
      mockSystemService.getStorage.mockRejectedValue(new Error(errorMessage));

      await expect(controller.storage()).rejects.toEqual({ error: errorMessage });
      expect(mockSystemService.getStorage).toHaveBeenCalled();
    });
  });
});
