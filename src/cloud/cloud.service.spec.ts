import { Test, TestingModule } from '@nestjs/testing';
import { CloudService } from './cloud.service';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import { getConfig } from 'src/lib/util';

// Mock the external dependencies
jest.mock('fs');
jest.mock('fs/promises');
jest.mock('src/lib/util', () => ({
  getConfig: jest.fn(),
  splitPath: jest.fn((path: string) => path.split('/')), // Simple mock for splitPath
}));

const mockGetConfig = getConfig as jest.Mock;

describe('CloudService', () => {
  let service: CloudService;
  const testCloudDir = '/test-cloud';

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock getConfig to return a specific test directory
    mockGetConfig.mockReturnValue(testCloudDir);

    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudService],
    }).compile();

    service = module.get<CloudService>(CloudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test resolvePath internal method indirectly via public methods ---
  // --- Test ensureExists internal method indirectly via public methods ---

  describe('exists', () => {
    it('should return true if path exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const result = service.exists('some/path');
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/some/path`);
      expect(result).toBe(true);
    });

    it('should return false if path does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = service.exists('some/other/path');
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/some/other/path`);
      expect(result).toBe(false);
    });
  });

  describe('existsMany', () => {
    it('should return true if all paths exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const paths = ['path1', 'path2'];
      const result = service.existsMany(paths);
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/path1`);
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/path2`);
      expect(result).toBe(true);
    });

    it('should return false if any path does not exist', () => {
      (fs.existsSync as jest.Mock).mockImplementation((path) => path.endsWith('path1'));
      const paths = ['path1', 'path2'];
      const result = service.existsMany(paths);
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/path1`);
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/path2`);
      expect(result).toBe(false);
    });
  });

  describe('createDir', () => {
    it('should create a directory if it does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);

      await service.createDir('base', 'newDir');
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/base/newDir`);
      expect(fsPromises.mkdir).toHaveBeenCalledWith(`${testCloudDir}/base/newDir`, { recursive: true });
    });

    it('should throw an error if directory already exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      await expect(service.createDir('base', 'existingDir')).rejects.toThrow('Directory already exists');
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/base/existingDir`);
      expect(fsPromises.mkdir).not.toHaveBeenCalled();
    });
  });

  describe('createFile', () => {
    it('should create a file if it does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await service.createFile('base', 'newFile.txt');
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/base/newFile.txt`);
      expect(fsPromises.writeFile).toHaveBeenCalledWith(`${testCloudDir}/base/newFile.txt`, '');
    });

    it('should throw an error if file already exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      await expect(service.createFile('base', 'existingFile.txt')).rejects.toThrow('File already exists');
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/base/existingFile.txt`);
      expect(fsPromises.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('read', () => {
    it('should read and return file content as string', async () => {
      const filePath = 'file.txt';
      const content = 'file content';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({ isDirectory: () => false });
      (fsPromises.readFile as jest.Mock).mockResolvedValue(content);

      const result = await service.read(filePath);
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/${filePath}`);
      expect(fs.lstatSync).toHaveBeenCalledWith(`${testCloudDir}/${filePath}`);
      expect(fsPromises.readFile).toHaveBeenCalledWith(`${testCloudDir}/${filePath}`, 'utf-8');
      expect(result).toBe(content);
    });

    it('should read and parse JSON file content', async () => {
      const filePath = 'file.json';
      const jsonData = { key: 'value' };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({ isDirectory: () => false });
      (fsPromises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(jsonData));

      const result = await service.read(filePath);
      expect(result).toEqual(jsonData);
    });

    it('should throw an error if path does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      await expect(service.read('nonexistent.txt')).rejects.toThrow('Path not found');
    });

    it('should throw an error if path is a directory', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({ isDirectory: () => true });
      await expect(service.read('directory/')).rejects.toThrow('Cannot read a directory');
    });
  });

  describe('write', () => {
    it('should write data to a file', async () => {
      const filePath = 'file.txt';
      const data = 'content to write';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({ isDirectory: () => false });
      (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await service.write(filePath, data);
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/${filePath}`);
      expect(fs.lstatSync).toHaveBeenCalledWith(`${testCloudDir}/${filePath}`);
      expect(fsPromises.writeFile).toHaveBeenCalledWith(`${testCloudDir}/${filePath}`, data, 'utf-8');
    });

    it('should stringify data if it is not a string', async () => {
        const filePath = 'file.json';
        const data = { key: 'value' };
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.lstatSync as jest.Mock).mockReturnValue({ isDirectory: () => false });
        (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);

        await service.write(filePath, data as any); // Cast to any to test non-string data
        expect(fsPromises.writeFile).toHaveBeenCalledWith(`${testCloudDir}/${filePath}`, JSON.stringify(data), 'utf-8');
      });

    it('should throw an error if path does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      await expect(service.write('nonexistent.txt', 'data')).rejects.toThrow('Path not found');
    });

    it('should throw an error if path is a directory', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({ isDirectory: () => true });
      await expect(service.write('directory/', 'data')).rejects.toThrow('Cannot write to a directory');
    });
  });

  describe('delete', () => {
    it('should delete a file or directory', async () => {
      const path = 'item_to_delete';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fsPromises.rm as jest.Mock).mockResolvedValue(undefined);

      await service.delete(path);
      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/${path}`);
      expect(fsPromises.rm).toHaveBeenCalledWith(`${testCloudDir}/${path}`, { recursive: true, force: true });
    });

    it('should throw an error if path does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      await expect(service.delete('nonexistent')).rejects.toThrow('Path not found');
    });
  });

  describe('list', () => {
    it('should list files and directories', async () => {
      const dir = 'some_dir';
      const filesInDir = ['file1.txt', 'subdir'];
      (fs.existsSync as jest.Mock).mockReturnValue(true); // For ensureExists
      (fsPromises.readdir as jest.Mock).mockResolvedValue(filesInDir);
      (fsPromises.lstat as jest.Mock)
        .mockResolvedValueOnce({ // file1.txt
          size: 100,
          isDirectory: () => false,
          birthtime: new Date(1),
          mtime: new Date(2),
        })
        .mockResolvedValueOnce({ // subdir
          size: 0,
          isDirectory: () => true,
          birthtime: new Date(3),
          mtime: new Date(4),
        });

      const result = await service.list(dir);

      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/${dir}`);
      expect(fsPromises.readdir).toHaveBeenCalledWith(`${testCloudDir}/${dir}`);
      expect(fsPromises.lstat).toHaveBeenCalledWith(`${testCloudDir}/${dir}/file1.txt`);
      expect(fsPromises.lstat).toHaveBeenCalledWith(`${testCloudDir}/${dir}/subdir`);
      expect(result).toEqual([
        { path: `${dir}/file1.txt`, name: 'file1.txt', size: 100, isDirectory: false, created: 1, modified: 2 },
        { path: `${dir}/subdir`, name: 'subdir', size: 0, isDirectory: true, created: 3, modified: 4 },
      ]);
    });

    it('should throw an error if directory does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      await expect(service.list('nonexistent_dir')).rejects.toThrow('Path not found');
    });
  });

  describe('stat', () => {
    it('should return file/directory stats', async () => {
      const path = 'some_item';
      const itemName = 'some_item';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fsPromises.lstat as jest.Mock).mockResolvedValue({
        size: 123,
        isDirectory: () => false,
        birthtime: new Date(5),
        mtime: new Date(6),
      });
      (getConfig as jest.Mock).mockReturnValue(testCloudDir); // Ensure getConfig is mocked for splitPath usage if any

      const result = await service.stat(path);

      expect(fs.existsSync).toHaveBeenCalledWith(`${testCloudDir}/${path}`);
      expect(fsPromises.lstat).toHaveBeenCalledWith(`${testCloudDir}/${path}`);
      expect(result).toEqual({
        path: path,
        name: itemName,
        size: 123,
        isDirectory: false,
        created: 5,
        modified: 6,
      });
    });

    it('should throw an error if path does not exist for stat', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        await expect(service.stat('nonexistent_item')).rejects.toThrow('Path not found');
      });
  });

  // TODO: Add tests for find, findContent, readMany, writeMany, deleteMany, move, moveMany, copy, copyMany, rename, renameMany, download, upload, cleanup
  // These will require more complex mocking setups, especially for stream-based operations like download and upload.
});
