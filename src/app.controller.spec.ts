import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FastifyReply } from 'fastify';
import * as fs from 'fs';
import { join } from 'path';

// Mock AppService
const mockAppService = {
  checkPin: jest.fn(),
};

// Mock fs.readFileSync
jest.mock('fs', () => ({
  ...jest.requireActual('fs'), // Import and retain default behavior
  readFileSync: jest.fn(),
}));

const mockReadFileSync = fs.readFileSync as jest.Mock;

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService); // Get the mocked instance if needed
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('pin', () => {
    it('should call appService.checkPin with the provided pin and return its result', () => {
      const testPin = '1234';
      const expectedResult = 'success';
      mockAppService.checkPin.mockReturnValue(expectedResult);

      const result = appController.pin(testPin);

      expect(mockAppService.checkPin).toHaveBeenCalledWith(testPin);
      expect(result).toBe(expectedResult);
    });

    it('should handle different results from appService.checkPin', () => {
      const testPin = 'wrong_pin';
      const expectedResult = 'fail';
      mockAppService.checkPin.mockReturnValue(expectedResult);

      const result = appController.pin(testPin);

      expect(mockAppService.checkPin).toHaveBeenCalledWith(testPin);
      expect(result).toBe(expectedResult);
    });
  });

  describe('handleDom', () => {
    let mockResponse: Partial<FastifyReply>;
    const mockHtmlContent = '<!DOCTYPE html><html><body>Test</body></html>';
    const expectedIndexPath = join(process.cwd(), 'client/src', 'index.html');

    beforeEach(() => {
      // Create a new mock for FastifyReply for each test in this describe block
      mockResponse = {
        type: jest.fn().mockReturnThis(), // Allow chaining
        send: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };
    });

    it('should serve index.html if found', () => {
      mockReadFileSync.mockReturnValue(mockHtmlContent);

      appController.handleDom(mockResponse as FastifyReply);

      expect(mockReadFileSync).toHaveBeenCalledWith(expectedIndexPath, 'utf8');
      expect(mockResponse.type).toHaveBeenCalledWith('text/html');
      expect(mockResponse.send).toHaveBeenCalledWith(mockHtmlContent);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 404 if index.html is not found (readFileSync throws error)', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      appController.handleDom(mockResponse as FastifyReply);

      expect(mockReadFileSync).toHaveBeenCalledWith(expectedIndexPath, 'utf8');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('File not found');
      expect(mockResponse.type).not.toHaveBeenCalledWith('text/html'); // Or check if it was called before send
    });
  });
});
