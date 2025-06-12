import { Test, TestingModule } from '@nestjs/testing';
import { CloudController } from './cloud.controller';
import { CloudService } from './cloud.service';
import { CloudGateway } from './cloud.gateway';
import { FastifyReply, FastifyRequest } from 'fastify';
import { splitPath } from 'src/lib/util'; // Import if used by mocks or tests

// Mocks
const mockCloudService = {
  list: jest.fn(),
  stat: jest.fn(),
  find: jest.fn(),
  findContent: jest.fn(),
  read: jest.fn(),
  readMany: jest.fn(),
  write: jest.fn(),
  writeMany: jest.fn(),
  createDir: jest.fn(),
  createFile: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  move: jest.fn(),
  moveMany: jest.fn(),
  copy: jest.fn(),
  copyMany: jest.fn(),
  rename: jest.fn(),
  renameMany: jest.fn(),
  download: jest.fn(),
  upload: jest.fn(),
};

const mockCloudGateway = {
  fileCreated: jest.fn(),
  folderRemoved: jest.fn(),
  routeUpdated: jest.fn(),
  folderRenamed: jest.fn(),
};

jest.mock('src/lib/util', () => ({
    ...jest.requireActual('src/lib/util'), // retain other functions from the module
    splitPath: jest.fn((path: string) => path.split(/[/\\]+/).filter(p => p)), // Basic mock for splitPath
}));


describe('CloudController', () => {
  let controller: CloudController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudController],
      providers: [
        { provide: CloudService, useValue: mockCloudService },
        { provide: CloudGateway, useValue: mockCloudGateway },
      ],
    }).compile();

    controller = module.get<CloudController>(CloudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test cases for each method
  describe('list', () => {
    it('should call cloudService.list and return its result', async () => {
      const mockPath = 'some/path';
      const mockResult: FileInfo[] = [{ name: 'file1.txt', path: 'some/path/file1.txt', size: 100, isDirectory: false, created: Date.now(), modified: Date.now() }];
      mockCloudService.list.mockResolvedValue(mockResult);

      const result = await controller.list(mockPath);
      expect(mockCloudService.list).toHaveBeenCalledWith(mockPath);
      expect(result).toEqual(mockResult);
    });

    it('should return a rejected promise if cloudService.list throws', async () => {
      const mockPath = 'some/path';
      const errorMessage = 'Service error';
      mockCloudService.list.mockRejectedValue(new Error(errorMessage));

      await expect(controller.list(mockPath)).rejects.toEqual({ error: errorMessage });
      expect(mockCloudService.list).toHaveBeenCalledWith(mockPath);
    });
  });

  describe('stat', () => {
    it('should call cloudService.stat and return its result', async () => {
      const mockPath = 'some/file.txt';
      const mockResult: FileInfo = { name: 'file.txt', path: 'some/file.txt', size: 120, isDirectory: false, created: Date.now(), modified: Date.now() };
      mockCloudService.stat.mockResolvedValue(mockResult);

      const result = await controller.stat(mockPath);
      expect(mockCloudService.stat).toHaveBeenCalledWith(mockPath);
      expect(result).toEqual(mockResult);
    });

    it('should return a rejected promise if cloudService.stat throws', async () => {
        const mockPath = 'some/file.txt';
        const errorMessage = 'Stat error';
        mockCloudService.stat.mockRejectedValue(new Error(errorMessage));

        await expect(controller.stat(mockPath)).rejects.toEqual({error: errorMessage});
    });
  });

  describe('write', () => {
    const mockPath = 'some/file.txt';
    const mockData = 'file content';

    it('should call cloudService.write and return success message', async () => {
      mockCloudService.write.mockResolvedValue(undefined);
      const result = await controller.write(mockPath, mockData);
      expect(mockCloudService.write).toHaveBeenCalledWith(mockPath, mockData);
      expect(result).toEqual({ message: 'File written successfully' });
    });

    it('should reject if path is "/"', async () => {
      await expect(controller.write('/', mockData)).rejects.toEqual({ error: 'Cannot write to root directory' });
      expect(mockCloudService.write).not.toHaveBeenCalled();
    });

    it('should return a rejected promise if cloudService.write throws', async () => {
        const errorMessage = 'Write error';
        mockCloudService.write.mockRejectedValue(new Error(errorMessage));
        await expect(controller.write(mockPath, mockData)).rejects.toEqual({error: errorMessage});
    });
  });

  describe('createDir', () => {
    const mockPath = 'base/path';
    const mockName = 'newDir';
    const fullPath = `${mockPath}/${mockName}`; // Assuming join mock behaves like this or mock join

    it('should call cloudService.createDir, notify gateway, and return success', async () => {
      mockCloudService.createDir.mockResolvedValue(undefined);
      (splitPath as jest.Mock).mockReturnValue(fullPath.split('/'));


      const result = await controller.createDir(mockPath, mockName);

      expect(mockCloudService.createDir).toHaveBeenCalledWith(mockPath, mockName);
      expect(mockCloudGateway.fileCreated).toHaveBeenCalledWith(fullPath.split('/'));
      expect(result).toEqual({ message: 'Directory created successfully' });
    });

    it('should return a rejected promise if cloudService.createDir throws', async () => {
        const errorMessage = 'CreateDir error';
        mockCloudService.createDir.mockRejectedValue(new Error(errorMessage));
        await expect(controller.createDir(mockPath, mockName)).rejects.toEqual({error: errorMessage});
        expect(mockCloudGateway.fileCreated).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const mockPath = 'some/item_to_delete';

    it('should call cloudService.delete, notify gateway, and return success', async () => {
      mockCloudService.delete.mockResolvedValue(undefined);
      const mockPathParts = mockPath.split('/');
      (splitPath as jest.Mock).mockImplementation((p) => p.split('/'));


      const result = await controller.delete(mockPath);

      expect(mockCloudService.delete).toHaveBeenCalledWith(mockPath);
      expect(mockCloudGateway.folderRemoved).toHaveBeenCalledWith(mockPathParts);
      expect(mockCloudGateway.routeUpdated).toHaveBeenCalledWith(mockPathParts.slice(0, -1));
      expect(result).toEqual({ message: 'File deleted successfully' });
    });

    it('should reject if path is "/"', async () => {
        await expect(controller.delete('/')).rejects.toEqual({ error: 'Cannot delete root directory' });
        expect(mockCloudService.delete).not.toHaveBeenCalled();
      });

    it('should return a rejected promise if cloudService.delete throws', async () => {
        const errorMessage = 'Delete error';
        mockCloudService.delete.mockRejectedValue(new Error(errorMessage));
        await expect(controller.delete(mockPath)).rejects.toEqual({error: errorMessage});
    });
  });

  describe('download', () => {
    const mockPath = 'some/downloadable_file.txt';
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
        mockReply = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            // header: jest.fn().mockReturnThis(), // Add if controller sets headers directly
        };
    });

    it('should call cloudService.download', async () => {
      mockCloudService.download.mockImplementation((path, res) => {
        // Simulate service calling res methods if necessary, or just acknowledge call
      });

      await controller.download(mockReply as FastifyReply, mockPath);
      expect(mockCloudService.download).toHaveBeenCalledWith(mockPath, mockReply);
    });

    it('should send 404 if cloudService.download throws', async () => {
        const errorMessage = 'Download service error';
        mockCloudService.download.mockImplementation(() => {
            throw new Error(errorMessage);
        });

        await controller.download(mockReply as FastifyReply, mockPath);
        expect(mockReply.status).toHaveBeenCalledWith(404);
        expect(mockReply.send).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('upload', () => {
    const mockPath = 'target/upload/dir';
    let mockRequest: Partial<FastifyRequest>;
    const mockFilesIterator = {
        [Symbol.asyncIterator]: jest.fn(() => ({
            next: jest.fn()
                .mockResolvedValueOnce({ value: { filename: 'file1.txt', file: { pipe: jest.fn(), on: jest.fn() }}, done: false })
                .mockResolvedValueOnce({ done: true })
        }))
    };

    beforeEach(() => {
        mockRequest = {
            files: jest.fn().mockReturnValue(mockFilesIterator as any), // as any to satisfy AsyncIterableIterator<MultipartFile>
            raw: {
                on: jest.fn(),
            } as any,
        };
    });

    it('should call cloudService.upload and setup event listeners, then notify gateway', async () => {
        const mockCancelFn = jest.fn();
        mockCloudService.upload.mockResolvedValue(mockCancelFn);
        (splitPath as jest.Mock).mockReturnValue(mockPath.split('/'));

        const result = await controller.upload(mockPath, mockRequest as FastifyRequest);

        expect(mockCloudService.upload).toHaveBeenCalledWith(mockPath, mockFilesIterator);
        expect(mockRequest.raw.on).toHaveBeenCalledWith('aborted', mockCancelFn);
        expect(mockRequest.raw.on).toHaveBeenCalledWith('close', mockCancelFn);
        expect(mockRequest.raw.on).toHaveBeenCalledWith('error', mockCancelFn);
        expect(mockCloudGateway.routeUpdated).toHaveBeenCalledWith(mockPath.split('/'));
        expect(result).toEqual({ message: 'File uploaded successfully' });
    });
  });

  // TODO: Add tests for find, findContent, read, readMany, writeMany, createDir, createFile, deleteMany, move, moveMany, copy, copyMany, rename, renameMany
  // These will follow similar patterns:
  // 1. Test success: service call, gateway notification (if any), correct response.
  // 2. Test service failure: service throws, controller rejects with { error: message }.
  // 3. Test input validation (like path === '/').
});

interface FileInfo {
  path: string;
  name: string;
  size: number;
  isDirectory: boolean;
  created: number;
  modified: number;
}
