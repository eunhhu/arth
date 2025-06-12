import { Test, TestingModule } from '@nestjs/testing';
import { SystemService } from './system.service';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

// Mock dependencies
jest.mock('fs');
jest.mock('fs/promises');
jest.mock('os');
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));
// We need to mock promisify to return our mocked exec
jest.mock('util', () => ({
  ...jest.requireActual('util'), // Retain other util functions
  promisify: jest.fn((fn) => {
    if (fn === exec) {
      return jest.fn(); // This will be our mock execAsync
    }
    return jest.requireActual('util').promisify(fn);
  }),
}));


const mockFsExistsSync = fs.existsSync as jest.Mock;
const mockFsReadFile = fsPromises.readFile as jest.Mock;

// Prepare a specific mock for execAsync by getting what promisify(exec) would return
const mockExecAsync = promisify(exec) as jest.Mock;


describe('SystemService', () => {
  let service: SystemService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemService],
    }).compile();

    service = module.get<SystemService>(SystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isValid', () => {
    it('should return true if /proc, /, and /data exist', () => {
      mockFsExistsSync.mockImplementation(path => ['/proc', '/', '/data'].includes(path));
      expect(service.isValid()).toBe(true);
      expect(mockFsExistsSync).toHaveBeenCalledWith('/proc');
      expect(mockFsExistsSync).toHaveBeenCalledWith('/');
      expect(mockFsExistsSync).toHaveBeenCalledWith('/data');
    });

    it('should return false if /proc does not exist', () => {
      mockFsExistsSync.mockImplementation(path => path !== '/proc');
      expect(service.isValid()).toBe(false);
    });
    it('should return false if / does not exist', () => {
      mockFsExistsSync.mockImplementation(path => path !== '/');
      expect(service.isValid()).toBe(false);
    });
    it('should return false if /data does not exist', () => {
      mockFsExistsSync.mockImplementation(path => path !== '/data');
      expect(service.isValid()).toBe(false);
    });
  });

  describe('getOSInfo', () => {
    it('should return various OS details', () => {
      const mockOsData = {
        hostname: 'test-host', type: 'Linux', platform: 'linux', arch: 'x64', machine: 'x86_64',
        version: '#1 SMP PREEMPT_DYNAMIC', release: '5.15.0', uptime: 12345, loadavg: [0.1, 0.2, 0.3],
        totalmem: 16000000000, freemem: 8000000000, cpus: [{ model: 'cpu1', speed: 3000, times: {} }],
        network: { eth0: [] }, userInfo: { uid: 1000 }, homedir: '/home/user', tmpdir: '/tmp', endianness: 'LE'
      };
      (os.hostname as jest.Mock).mockReturnValue(mockOsData.hostname);
      (os.type as jest.Mock).mockReturnValue(mockOsData.type);
      (os.platform as jest.Mock).mockReturnValue(mockOsData.platform);
      (os.arch as jest.Mock).mockReturnValue(mockOsData.arch);
      (os.machine as jest.Mock).mockReturnValue(mockOsData.machine);
      (os.version as jest.Mock).mockReturnValue(mockOsData.version);
      (os.release as jest.Mock).mockReturnValue(mockOsData.release);
      (os.uptime as jest.Mock).mockReturnValue(mockOsData.uptime);
      (os.loadavg as jest.Mock).mockReturnValue(mockOsData.loadavg);
      (os.totalmem as jest.Mock).mockReturnValue(mockOsData.totalmem);
      (os.freemem as jest.Mock).mockReturnValue(mockOsData.freemem);
      (os.cpus as jest.Mock).mockReturnValue(mockOsData.cpus as any);
      (os.networkInterfaces as jest.Mock).mockReturnValue(mockOsData.network as any);
      (os.userInfo as jest.Mock).mockReturnValue(mockOsData.userInfo as any);
      (os.homedir as jest.Mock).mockReturnValue(mockOsData.homedir);
      (os.tmpdir as jest.Mock).mockReturnValue(mockOsData.tmpdir);
      (os.endianness as jest.Mock).mockReturnValue(mockOsData.endianness as any);

      const osInfo = service.getOSInfo();
      expect(osInfo).toEqual(mockOsData);
    });
  });

  describe('getCPU', () => {
    it('should parse /proc/stat and return CPU usage', async () => {
      mockFsExistsSync.mockReturnValue(true);
      const statContent = `cpu  100 0 50 200 10 0 0 0 0 0
cpu0 50 0 25 100 5 0 0 0 0 0
cpu1 50 0 25 100 5 0 0 0 0 0`;
      mockFsReadFile.mockResolvedValue(statContent);

      const cpuInfo = await service.getCPU();
      // cpu: total = 360, idle = 200, iowait = 10. usage = (360-200-10)/360 = 150/360
      // cpu0: total = 180, idle = 100, iowait = 5. usage = (180-100-5)/180 = 75/180
      // cpu1: total = 180, idle = 100, iowait = 5. usage = (180-100-5)/180 = 75/180
      // total usage = ( (150/360) + (75/180) + (75/180) ) / 3 = ( (150+150+150)/360 ) / 3 = (450/360) / 3 = 1.25 / 3
      // The service calculates average of individual core usages: ((75/180) + (75/180)) / 2 = (75/180) = 0.41666...
      // The overall 'cpu' line usage is (360-200-10)/360 = 150/360 = 0.41666...
      // The service actually averages the usage of 'cpu', 'cpu0', 'cpu1'
      // usage = ( (150/360) + (75/180) + (75/180) ) / 3 = (0.4166... * 3) / 3 = 0.4166...
      // usage percentage: 0.41666 * 100 = 41.666...

      // Recalculating based on service logic:
      // Core 'cpu': total=360, idle=200, ioWait=10. usage=(360-200-10)/360 = 150/360 = 0.416666...
      // Core 'cpu0': total=180, idle=100, ioWait=5. usage=(180-100-5)/180 = 75/180 = 0.416666...
      // Core 'cpu1': total=180, idle=100, ioWait=5. usage=(180-100-5)/180 = 75/180 = 0.416666...
      // Average usage = (0.416666... + 0.416666... + 0.416666...) / 3 = 0.416666...
      // Percentage = 0.416666... * 100 = 41.6666...

      expect(cpuInfo.cores.length).toBe(3);
      expect(cpuInfo.cores[0].cpu).toBe('cpu');
      expect(cpuInfo.cores[0].usage).toBeCloseTo(150/360);
      expect(cpuInfo.cores[1].cpu).toBe('cpu0');
      expect(cpuInfo.cores[1].usage).toBeCloseTo(75/180);
      expect(cpuInfo.usage).toBeCloseTo((100 * ( (150/360) + (75/180) + (75/180) )) / 3 );
      expect(mockFsExistsSync).toHaveBeenCalledWith('/proc/stat');
      expect(mockFsReadFile).toHaveBeenCalledWith('/proc/stat', { encoding: 'utf-8' });
    });

    it('should throw if /proc/stat does not exist', async () => {
      mockFsExistsSync.mockReturnValue(false);
      await expect(service.getCPU()).rejects.toThrow('Host must be in android environment.');
    });
  });

  describe('getMemory', () => {
    it('should parse /proc/meminfo and return memory usage', async () => {
      mockFsExistsSync.mockReturnValue(true);
      const meminfoContent = `MemTotal:       1000 kB
MemFree:         100 kB
Buffers:          50 kB
Cached:          200 kB
SomeOtherKey:  123 kB`;
      mockFsReadFile.mockResolvedValue(meminfoContent);
      const memInfo = await service.getMemory();
      // MemUsage = 1000 - 100 - 50 - 200 = 650
      // usage = (100 * 650) / 1000 = 65
      expect(memInfo.MemTotal).toBe(1000);
      expect(memInfo.MemFree).toBe(100);
      expect(memInfo.Buffers).toBe(50);
      expect(memInfo.Cached).toBe(200);
      expect(memInfo.MemUsage).toBe(650);
      expect(memInfo.usage).toBe(65);
      expect(mockFsExistsSync).toHaveBeenCalledWith('/proc/meminfo');
      expect(mockFsReadFile).toHaveBeenCalledWith('/proc/meminfo', { encoding: 'utf-8' });
    });
    it('should throw if /proc/meminfo does not exist', async () => {
      mockFsExistsSync.mockReturnValue(false);
      await expect(service.getMemory()).rejects.toThrow('Host must be in android environment.');
    });
  });

  describe('getBattery', () => {
    it('should parse dumpsys battery output', async () => {
      mockFsExistsSync.mockReturnValue(true);
      const dumpsysOutput = `Current Battery Service state:
      AC powered: false
      USB powered: true
      Wireless powered: false
      status: 2
      health: 2
      present: true
      level: 90
      scale: 100
      voltage: 4000
      temperature: 300
      technology: Li-ion`;
      mockExecAsync.mockResolvedValue({ stdout: dumpsysOutput, stderr: '' });
      const batteryInfo = await service.getBattery();
      expect(batteryInfo['AC powered']).toBe('false');
      expect(batteryInfo['level']).toBe('90');
      expect(batteryInfo['error']).toBeUndefined();
      expect(mockFsExistsSync).toHaveBeenCalledWith('/sys/class/power_supply/battery/uevent');
      expect(mockExecAsync).toHaveBeenCalledWith('dumpsys battery');
    });
    it('should return stderr if exec fails', async () => {
      mockFsExistsSync.mockReturnValue(true);
      mockExecAsync.mockResolvedValue({ stdout: '', stderr: 'dumpsys error' });
      const batteryInfo = await service.getBattery();
      expect(batteryInfo.error).toBe('dumpsys error');
    });
    it('should throw if /sys/class/power_supply/battery/uevent does not exist', async () => {
      mockFsExistsSync.mockReturnValue(false);
      await expect(service.getBattery()).rejects.toThrow('Host must be in android environment.');
    });
  });

  describe('getStorage', () => {
    it('should parse df output for / and /data', async () => {
      mockFsExistsSync.mockImplementation(path => path === '/' || path === '/data');
      const dfOutput = `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/root        1000000   500000    500000  50% /
/dev/data        2000000  1000000   1000000  50% /data`;
      mockExecAsync.mockResolvedValue({ stdout: dfOutput, stderr: '' });
      const storageInfo = await service.getStorage();
      expect(storageInfo.root.filesystem).toBe('/dev/root');
      expect(storageInfo.root.size).toBe(1000000);
      expect(storageInfo.root.used).toBe(500000);
      expect(storageInfo.root.available).toBe(500000);
      expect(storageInfo.root.capacity).toBe(50);
      expect(storageInfo.root.mounted).toBe('/');
      expect(storageInfo.storage.filesystem).toBe('/dev/data');
      expect(storageInfo.storage.size).toBe(2000000);
      expect(storageInfo.storage.capacity).toBe(50);
      expect(storageInfo.error).toBeUndefined();
      expect(mockExecAsync).toHaveBeenCalledWith('df / /data');
    });
    it('should return stderr if df command fails', async () => {
      mockFsExistsSync.mockReturnValue(true);
      mockExecAsync.mockResolvedValue({ stdout: '', stderr: 'df error' });
      const storageInfo = await service.getStorage();
      expect(storageInfo.error).toBe('df error');
    });
    it('should throw if / or /data does not exist', async () => {
      mockFsExistsSync.mockImplementation(path => path !== '/data'); // Simulate /data not existing
      await expect(service.getStorage()).rejects.toThrow('Host must be in android environment.');
    });
  });
});
