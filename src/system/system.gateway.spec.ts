import { Test, TestingModule } from '@nestjs/testing';
import { SystemGateway } from './system.gateway';
import { SystemService } from './system.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// Mock SystemService
const mockSystemService = {
  isValid: jest.fn(),
  getOSInfo: jest.fn(),
  getCPU: jest.fn(),
  getMemory: jest.fn(),
  getBattery: jest.fn(),
  getStorage: jest.fn(),
};

// Mock Socket.IO Server and Client
const mockClientSocket = {
  emit: jest.fn(),
  broadcast: {
    emit: jest.fn(),
  },
  id: 'mockClientId',
};

const mockServer = {
  emit: jest.fn(),
};

// Mock Logger
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('SystemGateway', () => {
  let gateway: SystemGateway;
  let service: SystemService;
  // let server: Server; // will be assigned mockServer

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Use fake timers for interval testing

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemGateway,
        { provide: SystemService, useValue: mockSystemService },
        { provide: Logger, useValue: mockLogger }, // Provide the mock logger
      ],
    }).compile();

    // We need to get SystemService instance to set its mock return values before gateway constructor runs fully
    service = module.get<SystemService>(SystemService);
  });

  afterEach(() => {
    // Clear the interval manually if it was set by the gateway
    // Accessing private member for test cleanup.
    if ((gateway as any).interval) {
      clearInterval((gateway as any).interval);
    }
    jest.clearAllTimers(); // Clear all fake timers
    jest.useRealTimers(); // Restore real timers
  });

  const initializeGateway = async () => {
    // Re-compile or get from module to ensure constructor logic is hit with current mock setups
    // This is tricky because constructor logic runs once. We'll test constructor separately.
    // For other tests, we assume gateway is constructed and then assign server.
     const moduleRef = await Test.createTestingModule({
        providers: [
            SystemGateway,
            { provide: SystemService, useValue: mockSystemService },
            { provide: Logger, useValue: mockLogger },
        ],
    }).compile();
    gateway = moduleRef.get<SystemGateway>(SystemGateway);
    gateway.server = mockServer as any as Server;
  };


  describe('Constructor Logic and Interval', () => {
    it('should initialize logger and set up interval if systemService.isValid is true', async () => {
      mockSystemService.isValid.mockReturnValue(true);
      mockSystemService.getOSInfo.mockReturnValue({ hostname: 'test-os' });
      mockSystemService.getCPU.mockResolvedValue({ usage: 50 });
      mockSystemService.getMemory.mockResolvedValue({ total: 1000 });
      mockSystemService.getBattery.mockResolvedValue({ level: 90 });
      mockSystemService.getStorage.mockResolvedValue({ root: {} });

      await initializeGateway(); // Triggers constructor

      expect(mockLogger.log).toHaveBeenCalledWith('SystemGateway initialized');
      expect(mockSystemService.isValid).toHaveBeenCalled();
      expect((gateway as any).interval).toBeDefined();

      // Fast-forward time to trigger the interval
      jest.advanceTimersByTime(500);
      await Promise.resolve(); // Allow promises in interval to resolve

      expect(mockSystemService.getCPU).toHaveBeenCalled();
      expect(mockSystemService.getMemory).toHaveBeenCalled();
      expect(mockSystemService.getBattery).toHaveBeenCalled();
      expect(mockSystemService.getStorage).toHaveBeenCalled();
      expect(mockSystemService.getOSInfo).toHaveBeenCalled(); // Called inside interval
      expect(mockServer.emit).toHaveBeenCalledWith('update-info', {
        os: { hostname: 'test-os' },
        cpu: { usage: 50 },
        memory: { total: 1000 },
        battery: { level: 90 },
        storage: { root: {} },
      });
    });

    it('should not set up interval if systemService.isValid is false', async () => {
      mockSystemService.isValid.mockReturnValue(false);

      await initializeGateway(); // Triggers constructor

      expect(mockLogger.log).toHaveBeenCalledWith('SystemGateway initialized');
      expect(mockSystemService.isValid).toHaveBeenCalled();
      expect((gateway as any).interval).toBeUndefined();
      expect(mockServer.emit).not.toHaveBeenCalled(); // Emit should not happen
    });
  });

  // For tests below, we assume gateway is initialized and interval might be running or not.
  // We call initializeGateway() to ensure a fresh instance for each context.

  describe('Lifecycle Hooks', () => {
    beforeEach(async () => {
        mockSystemService.isValid.mockReturnValue(false); // Prevent interval by default for these
        await initializeGateway();
    });

    it('handleConnection should execute without error', () => {
      expect(() => gateway.handleConnection(mockClientSocket as any as Socket)).not.toThrow();
    });

    it('handleDisconnect should execute without error', () => {
      expect(() => gateway.handleDisconnect(mockClientSocket as any as Socket)).not.toThrow();
    });
  });

  describe_('SubscribeMessage("message") - handleMessage', () => {
    beforeEach(async () => {
        mockSystemService.isValid.mockReturnValue(false); // Prevent interval by default
        await initializeGateway();
    });

    it('should emit the message back to the sender and broadcast to others', () => {
      const messageArgs = ['test message', { data: 123 }];
      gateway.handleMessage(mockClientSocket as any as Socket, ...messageArgs);

      expect(mockClientSocket.emit).toHaveBeenCalledWith('message', ...messageArgs);
      expect(mockClientSocket.broadcast.emit).toHaveBeenCalledWith('message', ...messageArgs);
    });

    it('should handle different message arguments', () => {
      const messageArgs1 = ['hello'];
      gateway.handleMessage(mockClientSocket as any as Socket, ...messageArgs1);
      expect(mockClientSocket.emit).toHaveBeenCalledWith('message', ...messageArgs1);
      expect(mockClientSocket.broadcast.emit).toHaveBeenCalledWith('message', ...messageArgs1);

      const messageArgs2 = [{ complex: { object: true } }, 42];
      gateway.handleMessage(mockClientSocket as any as Socket, ...messageArgs2);
      expect(mockClientSocket.emit).toHaveBeenCalledWith('message', ...messageArgs2);
      expect(mockClientSocket.broadcast.emit).toHaveBeenCalledWith('message', ...messageArgs2);
    });
  });
});
