import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

@Injectable()
export class SystemService {
  isValid() {
    return existsSync('/proc') && existsSync('/') && existsSync('/data');
  }

  getOSInfo() {
    return {
      hostname: os.hostname(),
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      machine: os.machine(),
      version: os.version(),
      release: os.release(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpus: os.cpus(),
      network: os.networkInterfaces(),
      userInfo: os.userInfo(),
      homedir: os.homedir(),
      tmpdir: os.tmpdir(),
      endianness: os.endianness(),
    };
  }

  async getCPU() {
    const path = '/proc/stat';
    if (!existsSync(path)) throw new Error('Host must be in android environment.');
    const file = await readFile(path, { encoding: 'utf-8' });
    const cores = file
      .split('\n')
      .filter(line => line.startsWith('cpu'))
      .map(line => {
        const [cpu, ...times] = line.split(/\s+/);
        const numericTimes = times.map(t => parseInt(t, 10) || 0);
        const idle = numericTimes[3];
        const ioWait = numericTimes[4];
        const total = numericTimes.reduce((acc, t) => acc + t, 0);
        return {
          cpu,
          usage: (total - idle - ioWait) / total,
          total
        };
      });
    const usage = (100 * cores.reduce((acc, c) => acc + c.usage, 0)) / cores.length;
    return { cores, usage };
  }

  async getMemory() {
    const path = '/proc/meminfo';
    if (!existsSync(path)) throw new Error('Host must be in android environment.');
    const file = await readFile(path, { encoding: 'utf-8' });
    const memoryInfo: Record<string, number> = {};
    file.split('\n').forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.trim().split(':').map(s => s.trim());
        memoryInfo[key] = parseInt(value.split(' ')[0], 10) || 0;
      }
    });
    const { MemTotal = 0, MemFree = 0, Buffers = 0, Cached = 0 } = memoryInfo;
    const MemUsage = MemTotal - MemFree - Buffers - Cached;
    return {
      ...memoryInfo,
      MemUsage,
      usage: (100 * MemUsage) / MemTotal
    };
  }

  async getBattery() {
    const path = '/sys/class/power_supply/battery/uevent';
    if (!existsSync(path)) throw new Error('Host must be in android environment.');
    const { stdout, stderr } = await execAsync('dumpsys battery');
    if (stderr) return { error: stderr };
    const batteryInfo: Record<string, string> = {};
    stdout.split('\n').forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.trim().split(':').map(s => s.trim());
        batteryInfo[key] = value;
      }
    });
    return batteryInfo;
  }

  async getStorage() {
    if (!existsSync('/') || !existsSync('/data')) throw new Error('Host must be in android environment.');
    const { stdout, stderr } = await execAsync('df / /data');
    if (stderr) return { error: stderr };
    const lines = stdout.split('\n').slice(1).filter(line => line.trim());
    const storageInfo: Record<string, any> = {};
    lines.forEach((line, i: number) => {
      const [filesystem, sizeStr, usedStr, availStr, capStr, mounted] = line.trim().split(/\s+/);
      const size = parseInt(sizeStr, 10) || 0;
      const used = parseInt(usedStr, 10) || 0;
      const available = parseInt(availStr, 10) || 0;
      const capacity = parseInt(capStr.replace('%', ''), 10) || 0;
      const name = i === 0 ? 'root' : 'storage';
      storageInfo[name] = { filesystem, size, used, available, capacity, mounted };
    });
    return storageInfo;
  }
}
