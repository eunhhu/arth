import { Test, TestingModule } from '@nestjs/testing';
import { CloudGateway } from './cloud.gateway';
import { CloudService } from './cloud.service';
import { Server, Socket } from 'socket.io';

// Mock CloudService
const mockCloudService = {
  list: jest.fn(),
  stat: jest.fn(),
};

// Mock Socket.IO Server and Client
const mockClientSocket = {
  id: 'testClientId',
  emit: jest.fn(),
  join: jest.fn(), // Though not used in CloudGateway's 'route', good to have
  leave: jest.fn(),
};

const mockClientSocket2 = {
  id: 'testClientId2',
  emit: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
};

const mockServerEmitter = {
  emit: jest.fn(),
};

const mockServer = {
  to: jest.fn(() => mockServerEmitter), // server.to(clientId) returns an object that has an emit method
  emit: jest.fn(), // For general server emits if any
};

describe('CloudGateway', () => {
  let gateway: CloudGateway;
  let service: CloudService;
  // let server: Server; // Not strictly needed if gateway.server is always assigned the mock

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudGateway,
        { provide: CloudService, useValue: mockCloudService },
      ],
    }).compile();

    gateway = module.get<CloudGateway>(CloudGateway);
    service = module.get<CloudService>(CloudService);
    gateway.server = mockServer as any as Server; // Manually assign mock server
    // Clear the controls map before each test
    (gateway as any).controls.clear();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('Lifecycle Hooks', () => {
    it('handleConnection should add client to controls', () => {
      gateway.handleConnection(mockClientSocket as any as Socket);
      expect((gateway as any).controls.has(mockClientSocket.id)).toBe(true);
      expect((gateway as any).controls.get(mockClientSocket.id)).toEqual([]);
    });

    it('handleDisconnect should remove client from controls', () => {
      (gateway as any).controls.set(mockClientSocket.id, []);
      gateway.handleDisconnect(mockClientSocket as any as Socket);
      expect((gateway as any).controls.has(mockClientSocket.id)).toBe(false);
    });
  });

  describe_('SubscribeMessage("route")', () => {
    const pathArray = ['path', 'to', 'folder'];
    const pathString = 'path/to/folder';

    it('should update client route, call service.list, and emit "list" to client on success', async () => {
      const listResult = [{ name: 'file.txt' }];
      mockCloudService.list.mockResolvedValue(listResult);

      await gateway.route(mockClientSocket as any as Socket, pathArray);

      expect((gateway as any).controls.get(mockClientSocket.id)).toEqual(pathArray);
      expect(mockCloudService.list).toHaveBeenCalledWith('/' + pathString);
      expect(mockClientSocket.emit).toHaveBeenCalledWith('list', listResult);
    });

    it('should emit "list" with error to client if service.list fails', async () => {
      const errorMessage = 'Failed to list';
      mockCloudService.list.mockRejectedValue(new Error(errorMessage));

      await gateway.route(mockClientSocket as any as Socket, pathArray);

      expect((gateway as any).controls.get(mockClientSocket.id)).toEqual(pathArray);
      expect(mockCloudService.list).toHaveBeenCalledWith('/' + pathString);
      expect(mockClientSocket.emit).toHaveBeenCalledWith('list', { error: errorMessage });
    });
  });

  describe_('SubscribeMessage("stat")', () => {
    const filePath = 'path/to/file.txt';

    it('should call service.stat and emit "stat" to client on success', async () => {
      const statResult = { name: 'file.txt', size: 123 };
      mockCloudService.stat.mockResolvedValue(statResult);

      await gateway.stat(mockClientSocket as any as Socket, filePath);

      expect(mockCloudService.stat).toHaveBeenCalledWith(filePath);
      expect(mockClientSocket.emit).toHaveBeenCalledWith('stat', statResult);
    });

    it('should emit "stat" with error to client if service.stat fails', async () => {
      const errorMessage = 'Failed to stat';
      mockCloudService.stat.mockRejectedValue(new Error(errorMessage));

      await gateway.stat(mockClientSocket as any as Socket, filePath);

      expect(mockCloudService.stat).toHaveBeenCalledWith(filePath);
      expect(mockClientSocket.emit).toHaveBeenCalledWith('stat', { error: errorMessage });
    });
  });

  describe('folderRemoved', () => {
    it('should emit "folderRemoved" to clients watching the removed path or its parent', () => {
      const pathClient1 = ['a', 'b', 'c']; // Watching a/b/c
      const pathClient2 = ['a', 'b'];    // Watching a/b (parent of removed a/b/d)
      const pathClient3 = ['x', 'y'];    // Watching x/y (unrelated)
      (gateway as any).controls.set(mockClientSocket.id, pathClient1);
      (gateway as any).controls.set(mockClientSocket2.id, pathClient2);
      (gateway as any).controls.set('otherClient', pathClient3);

      const removedPath = ['a', 'b', 'd']; // Folder a/b/d is removed
      gateway.folderRemoved(removedPath);

      expect(mockServer.to).toHaveBeenCalledWith(mockClientSocket.id); // Client1 watching a/b/c, parent of a/b/d is a/b. Path a/b/c does not start with a/b/d. But a/b/c's parent (a/b) is parent of a/b/d
      // The logic is: (valuePath.startsWith(removedPath) || valuePath === path.slice(0, -1).join('/'))
      // For client1 (a/b/c):
      //   'a/b/c'.startsWith('a/b/d') -> false
      //   'a/b/c' === 'a/b' (parent of removedPath) -> false. This client should NOT be notified.
      // For client2 (a/b):
      //   'a/b'.startsWith('a/b/d') -> false
      //   'a/b' === 'a/b' (parent of removedPath) -> true. This client SHOULD be notified.

      // Let's re-evaluate based on the code:
      // path.slice(0,-1) for removedPath ['a','b','d'] is ['a','b']
      // Client1 (value = ['a','b','c'], valuePath = 'a/b/c'):
      //   valuePath.startsWith('a/b/d') -> false
      //   valuePath === 'a/b' -> false.  NO emit for client1.
      // Client2 (value = ['a','b'], valuePath = 'a/b'):
      //   valuePath.startsWith('a/b/d') -> false
      //   valuePath === 'a/b' -> true. EMIT for client2.

      expect(mockServer.to).toHaveBeenCalledWith(mockClientSocket2.id);
      expect(mockServerEmitter.emit).toHaveBeenCalledWith('folderRemoved', ['a', 'b']); // Emits parent of removed path
      expect(mockServer.to).not.toHaveBeenCalledWith(mockClientSocket.id); // Corrected expectation
      expect(mockServer.to).not.toHaveBeenCalledWith('otherClient');
      expect(mockServerEmitter.emit).toHaveBeenCalledTimes(1); // Only client2
    });
  });

  describe('fileCreated', () => {
    it('should call service.stat and emit "fileCreated" to clients watching the parent path', async () => {
      const createdFilePathArray = ['a', 'b', 'newfile.txt'];
      const parentPath = ['a', 'b'];
      const fileStat = { name: 'newfile.txt', size: 0 };
      mockCloudService.stat.mockResolvedValue(fileStat);

      (gateway as any).controls.set(mockClientSocket.id, parentPath); // Client watching parent
      (gateway as any).controls.set(mockClientSocket2.id, ['a']);    // Client watching grandparent (should not be notified)
      (gateway as any).controls.set('otherClient', ['x','y']); // Unrelated

      await gateway.fileCreated(createdFilePathArray);

      expect(mockCloudService.stat).toHaveBeenCalledWith('a/b/newfile.txt');
      expect(mockServer.to).toHaveBeenCalledWith(mockClientSocket.id);
      expect(mockServerEmitter.emit).toHaveBeenCalledWith('fileCreated', fileStat);
      expect(mockServer.to).not.toHaveBeenCalledWith(mockClientSocket2.id);
      expect(mockServer.to).not.toHaveBeenCalledWith('otherClient');
      expect(mockServerEmitter.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('routeUpdated', () => {
    it('should call service.list and emit "list" to clients watching the exact path', async () => {
        const updatedPathArray = ['a', 'b'];
        const listResult = [{ name: 'file1.txt' }];
        mockCloudService.list.mockResolvedValue(listResult);

        (gateway as any).controls.set(mockClientSocket.id, updatedPathArray); // Client watching the updated path
        (gateway as any).controls.set(mockClientSocket2.id, ['a']);        // Client watching a parent (should not be notified)
        (gateway as any).controls.set('otherClient', ['a','b','c']);     // Client watching a sub-path (should not be notified)


        await gateway.routeUpdated(updatedPathArray);

        expect(mockCloudService.list).toHaveBeenCalledWith('/a/b');
        expect(mockServer.to).toHaveBeenCalledWith(mockClientSocket.id);
        expect(mockServerEmitter.emit).toHaveBeenCalledWith('list', listResult);
        expect(mockServer.to).not.toHaveBeenCalledWith(mockClientSocket2.id);
        expect(mockServer.to).not.toHaveBeenCalledWith('otherClient');
        expect(mockServerEmitter.emit).toHaveBeenCalledTimes(1);
    });
  });

  // TODO: Add tests for folderRenamed, covering similar logic for path matching and emissions.
});
