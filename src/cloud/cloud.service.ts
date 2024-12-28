import { Injectable } from '@nestjs/common';
import { createReadStream, createWriteStream, existsSync, lstatSync } from 'fs';
import { cp, lstat, mkdir, readdir, readFile, rename, rm, writeFile } from 'fs/promises';
import { FastifyReply } from 'fastify';
import { join } from 'path';
import { MultipartFile } from '@fastify/multipart';
import { getConfig, splitPath } from 'src/lib/util';
import { MemoryStorageFile } from '@blazity/nest-file-fastify';

@Injectable()
export class CloudService {
  private readonly cloudDir = getConfig('cloud');

  private resolvePath(path: string): string {
    return join(this.cloudDir, path);
  }

  private ensureExists(path: string): string {
    const resolved = this.resolvePath(path);
    if (!existsSync(resolved)) throw new Error(`Path not found: ${path} | ${resolved}`);
    return resolved;
  }

  private ensureAllExist(paths: string[]): string[] {
    const resolvedPaths = paths.map((p) => this.resolvePath(p));
    if (!resolvedPaths.every((rp) => existsSync(rp))) throw new Error('Some paths not found');
    return resolvedPaths;
  }

  exists(path: string): boolean {
    return existsSync(this.resolvePath(path));
  }

  existsMany(paths: string[]): boolean {
    return paths.map((p) => this.resolvePath(p)).every((rp) => existsSync(rp));
  }

  async list(dir: string): Promise<FileInfo[]> {
    const resolvedDir = this.ensureExists(dir);
    const files = await readdir(resolvedDir);
    return Promise.all(
      files.map(async (file) => {
        const filePath = join(resolvedDir, file);
        const stat = await lstat(filePath);
        return {
          path: join(dir, file),
          name: file,
          size: stat.size,
          isDirectory: stat.isDirectory(),
          created: stat.birthtime.getTime(),
          modified: stat.mtime.getTime(),
        };
      }),
    );
  }

  async stat(path: string): Promise<FileInfo> {
    const resolved = this.ensureExists(path);
    const stat = await lstat(resolved);
    return {
      path,
      name: splitPath(path).pop(),
      size: stat.size,
      isDirectory: stat.isDirectory(),
      created: stat.birthtime.getTime(),
      modified: stat.mtime.getTime(),
    };
  }

  async find(dir: string, name: string, type: 'file' | 'dir' = 'file', depths = 4): Promise<FileInfo[]> {
    if (depths < 0) return [];
    this.ensureExists(dir);
    const files = await this.list(dir);
    const matched = files.filter(
      (f) => f.name.includes(name) && (type === 'file' ? !f.isDirectory : f.isDirectory),
    );
    const subdirs = files.filter((f) => f.isDirectory);
    const results = await Promise.all(
      subdirs.map((sd) => this.find(join(dir, sd.name), name, type, depths - 1)),
    );
    return matched.concat(...results);
  }

  async findContent(dir: string, content: string, depths = 4): Promise<FileInfo[]> {
    if (depths < 0) return [];
    this.ensureExists(dir);
    const result: FileInfo[] = [];
    const files = await this.list(dir);

    await Promise.all(
      files.map(async (file) => {
        const path = join(dir, file.name);
        if (file.isDirectory) {
          result.push(...(await this.findContent(path, content, depths - 1)));
        } else {
          const data = await this.read(path);
          if (typeof data === 'string' && data.includes(content)) {
            result.push(file);
          }
        }
      }),
    );
    return result;
  }

  async read(filePath: string): Promise<string> {
    const resolved = this.ensureExists(filePath);
    if (lstatSync(resolved).isDirectory()) throw new Error('Cannot read a directory');
    const content = await readFile(resolved, 'utf-8');
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }

  async readMany(paths: string[]): Promise<string[]> {
    const resolvedPaths = this.ensureAllExist(paths);
    return Promise.all(resolvedPaths.map((p) => this.read(p)));
  }

  async write(filePath: string, data: string): Promise<void> {
    const resolved = this.ensureExists(filePath);
    if (lstatSync(resolved).isDirectory()) throw new Error('Cannot write to a directory');
    await writeFile(resolved, typeof data === 'string' ? data : JSON.stringify(data), 'utf-8');
  }

  async writeMany(paths: string[], data: string[]): Promise<void> {
    const resolvedPaths = this.ensureAllExist(paths);
    await Promise.all(resolvedPaths.map((p, i) => this.write(p, data[i])));
  }

  async createDir(base: string, name: string): Promise<void> {
    const resolvedBase = this.resolvePath(base);
    const target = join(resolvedBase, name);
    if (existsSync(target)) throw new Error('Directory already exists');
    await mkdir(target, { recursive: true });
  }

  async createFile(base: string, name: string): Promise<void> {
    const resolvedBase = this.resolvePath(base);
    const target = join(resolvedBase, name);
    if (existsSync(target)) throw new Error('File already exists');
    await writeFile(target, '');
  }

  async delete(path: string): Promise<void> {
    const resolved = this.ensureExists(path);
    await rm(resolved, { recursive: true, force: true });
  }

  async deleteMany(paths: string[]): Promise<void> {
    this.ensureAllExist(paths);
    await Promise.all(paths.map((p) => this.delete(p)));
  }

  async move(oldPath: string, newDir: string): Promise<void> {
    const resolvedOld = this.ensureExists(oldPath);
    const target = join(newDir, splitPath(oldPath).pop()!);
    if (this.exists(target)) throw new Error('File already exists');
    const resolvedTarget = this.resolvePath(target);
    await rename(resolvedOld, resolvedTarget);
  }

  async moveMany(paths: string[], newDir: string): Promise<void> {
    this.ensureAllExist(paths);
    await Promise.all(paths.map((p) => this.move(p, newDir)));
  }

  async copy(oldPath: string, newDir: string): Promise<void> {
    const resolvedOld = this.ensureExists(oldPath);
    const target = join(newDir, splitPath(oldPath).pop()!);
    if (this.exists(target)) throw new Error('File already exists');
    const resolvedTarget = this.resolvePath(target);
    await cp(resolvedOld, resolvedTarget, { recursive: true });
  }

  async copyMany(paths: string[], newDir: string): Promise<void> {
    this.ensureAllExist(paths);
    await Promise.all(paths.map((p) => this.copy(p, newDir)));
  }

  async rename(path: string, newName: string): Promise<void> {
    this.ensureExists(path);
    const target = join(path, '..', newName);
    if (this.exists(target)) throw new Error('File already exists');
    await rename(this.resolvePath(path), this.resolvePath(target));
  }

  async renameMany(paths: string[], baseName: string): Promise<void> {
    this.ensureAllExist(paths);
    await Promise.all(paths.map((p, i) => this.rename(p, `${baseName}_${i}`)));
  }

  async download(dir: string, res: FastifyReply): Promise<void> {
    const resolved = this.ensureExists(dir);
    const stat = await lstat(resolved);
    res
      .header('Content-Type', 'application/octet-stream')
      .header('Content-Disposition', `attachment; filename="${splitPath(dir).pop()}"`)
      .header('Content-Length', stat.size);
    if (stat.isDirectory()) throw new Error('Cannot download a directory');
    createReadStream(resolved).pipe(res.raw);
  }

  async upload(
    dir: string,
    files:  AsyncIterableIterator<MultipartFile>
  ): Promise<() => void> {
    const resolved = this.resolvePath(dir);
    const uploadPromises = [];
    for await (const file of files) {
      const filePath = join(resolved, file.filename || `file_${Date.now()}`);
      const saveFilePromise = new Promise((resolve, reject) => {
        const writeStream = createWriteStream(filePath);
        file.file.pipe(writeStream);
        file.file.on('end', resolve);
        file.file.on('error', reject);
      });
      uploadPromises.push(saveFilePromise);
    }
    await Promise.all(uploadPromises);
    return () => {
      uploadPromises.forEach(p => p.cancel());
    };
  }

  async cleanup(dir: string): Promise<void> {
    const resolved = this.resolvePath(dir);
    if (!existsSync(resolved)) return;
    await rm(resolved, { recursive: true, force: true });
  }
}
