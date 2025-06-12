import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseGateway } from './database.gateway';
import { Server, Socket } from 'socket.io';

// Create mocks for Server and Socket
const mockSocket = {
  join: jest.fn(),
  leave: jest.fn(),
  emit: jest.fn(),
  id: 'mockSocketId',
};

const mockServer = {
  emit: jest.fn(),
  to: jest.fn(() => ({ emit: jest.fn() })), // If server.to(room).emit() is used
};

describe('DatabaseGateway', () => {
  let gateway: DatabaseGateway;
  // let server: Server; // Mock server will be assigned directly

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseGateway],
    }).compile();

    gateway = module.get<DatabaseGateway>(DatabaseGateway);
    // Manually assign the mock server to the gateway instance
    gateway.server = mockServer as any as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should handle a new client connection', () => {
      // Method is currently empty
      expect(() => gateway.handleConnection(mockSocket as any as Socket)).not.toThrow();
      // Example: if it logged: expect(console.log).toHaveBeenCalledWith(`Client connected: ${mockSocket.id}`);
    });
  });

  describe('handleDisconnect', () => {
    it('should handle a client disconnection', () => {
      // Method is currently empty
      expect(() => gateway.handleDisconnect(mockSocket as any as Socket)).not.toThrow();
      // Example: if it logged: expect(console.log).toHaveBeenCalledWith(`Client disconnected: ${mockSocket.id}`);
    });
  });

  describe_('SubscribeMessage("route")', () => {
    it('should make the client join the specified room (collection)', () => {
      const collectionName = 'usersCollection';
      gateway.route(mockSocket as any as Socket, collectionName);
      expect(mockSocket.join).toHaveBeenCalledWith(collectionName);
    });

    it('should correctly join different rooms for different collections', () => {
      const collectionName1 = 'orders';
      const collectionName2 = 'products';

      gateway.route(mockSocket as any as Socket, collectionName1);
      expect(mockSocket.join).toHaveBeenCalledWith(collectionName1);

      // Reset mock for the next call or ensure it's called with the new argument
      // jest.clearAllMocks() in beforeEach handles this if calls are independent per test.
      // If multiple calls in one test, ensure mock tracking is appropriate.
      // Here, join is called on the same mockSocket instance.
      gateway.route(mockSocket as any as Socket, collectionName2);
      expect(mockSocket.join).toHaveBeenCalledWith(collectionName2);
      expect(mockSocket.join).toHaveBeenCalledTimes(2); // Verifies it was called again for the second collection
    });
  });

  // If DatabaseGateway had public methods that emit events, they would be tested here.
  // Example:
  // describe('notifyNewCollection', () => {
  //   it('should emit "newCollection" event to all clients in the "admin" room', () => {
  //     const collectionData = { name: 'logs', size: 0 };
  //     const adminRoom = 'admin';
  //     const serverToSpy = jest.spyOn(mockServer, 'to');
  //     const emitSpy = jest.fn();
  //     serverToSpy.mockReturnValue({ emit: emitSpy } as any);

  //     gateway.notifyNewCollection(adminRoom, collectionData); // Assuming such a method exists

  //     expect(serverToSpy).toHaveBeenCalledWith(adminRoom);
  //     expect(emitSpy).toHaveBeenCalledWith('newCollection', collectionData);
  //   });
  // });
});
