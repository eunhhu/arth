import { Test, TestingModule } from '@nestjs/testing';
import { AppGateway } from './app.gateway';
import { Server, Socket } from 'socket.io';

// Create mocks for Server and Socket
const mockSocket = {
  join: jest.fn(),
  leave: jest.fn(), // Add other methods if they become used
  emit: jest.fn(),
  id: 'mockSocketId',
};

const mockServer = {
  emit: jest.fn(),
  // Add other server methods if used by the gateway
};

describe('AppGateway', () => {
  let gateway: AppGateway;
  let server: Server;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppGateway],
    })
    // Manually inject the mock server instance into the gateway after it's created
    // This is a common way to handle @WebSocketServer() or other direct injections in tests
    // if not using a more complex setup like an end-to-end test environment.
    .overrideProvider(Server) // This might not be standard, usually @WebSocketServer sets it.
    .useValue(mockServer)      // We'll assign it directly after getting the gateway instance.
    .compile();

    gateway = module.get<AppGateway>(AppGateway);
    // Directly assign the mock server to the gateway instance
    gateway.server = mockServer as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should handle a new client connection', () => {
      // The method is currently empty, so we just call it to ensure no errors
      expect(() => gateway.handleConnection(mockSocket as any as Socket)).not.toThrow();
      // If there were logic, e.g., logging or adding to a list:
      // expect(console.log).toHaveBeenCalledWith(`Client connected: ${mockSocket.id}`);
    });
  });

  describe('handleDisconnect', () => {
    it('should handle a client disconnection', () => {
      // The method is currently empty
      expect(() => gateway.handleDisconnect(mockSocket as any as Socket)).not.toThrow();
      // If there were logic, e.g., logging or removing from a list:
      // expect(console.log).toHaveBeenCalledWith(`Client disconnected: ${mockSocket.id}`);
    });
  });

  describe_('SubscribeMessage("route")', () => {
    it('should make the client join the specified room (collection)', () => {
      const collectionName = 'testCollection';
      gateway.route(mockSocket as any as Socket, collectionName);
      expect(mockSocket.join).toHaveBeenCalledWith(collectionName);
    });

    it('should handle different collection names', () => {
      const collectionName1 = 'orders';
      const collectionName2 = 'users';

      gateway.route(mockSocket as any as Socket, collectionName1);
      expect(mockSocket.join).toHaveBeenCalledWith(collectionName1);

      gateway.route(mockSocket as any as Socket, collectionName2);
      expect(mockSocket.join).toHaveBeenCalledWith(collectionName2);
    });
  });
});
