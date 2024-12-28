import { Body, Controller, Get, Post, Query, Req, Res, UseInterceptors } from '@nestjs/common';
import { CloudService } from './cloud.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CloudGateway } from './cloud.gateway';
import { join } from 'path';
import { splitPath } from 'src/lib/util';
import { FileFieldsInterceptor, FilesInterceptor, MemoryStorageFile, UploadedFiles } from '@blazity/nest-file-fastify';
import { MultipartFile } from '@fastify/multipart';
import { createWriteStream } from 'fs';

@Controller("api/cloud")
export class CloudController {
  constructor(
    private readonly cloudService: CloudService,
    private readonly cloudGateway: CloudGateway
  ) {}

  @Get("list")
  async list(@Query("path") path: string): Promise<FileInfo[]> {
    try{
      const result = await this.cloudService.list(path)
      return result;
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("stat")
  async stat(@Query("path") path: string): Promise<FileInfo> {
    try{
      const result = await this.cloudService.stat(path)
      return result;
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("find")
  async find(@Query("path") path: string, @Query("name") name: string, @Query("type") type: "file" | "dir"): Promise<FileInfo[]> {
    try{
      const result = await this.cloudService.find(path, name, type)
      return result;
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("findContent")
  async findContent(@Query("path") path: string, @Body("content") content: string): Promise<FileInfo[]> {
    try{
      const result = await this.cloudService.findContent(path, content)
      return result;
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("read")
  async read(@Query("path") path: string): Promise<string> {
    try{
      const result = await this.cloudService.read(path)
      return result;
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("readMany")
  async readMany(@Body("paths") paths: string[]): Promise<string[]> {
    try{
      const result = await this.cloudService.readMany(paths)
      return result;
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("write")
  async write(@Query("path") path: string, @Body("data") data: string): Promise<{}> {
    if(path === "/") return Promise.reject({error: "Cannot write to root directory"})
    try{
      await this.cloudService.write(path, data);
      return {message: "File written successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("writeMany")
  async writeMany(@Body("paths") paths: string[], @Body("data") data: string[]): Promise<{}> {
    if(paths.includes("/")) return Promise.reject({error: "Cannot write to root directory"})
    try{
      await this.cloudService.writeMany(paths, data);
      return {message: "Files written successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("createDir")
  async createDir(@Query("path") path: string, @Query("name") name: string): Promise<{}> {
    try{
      await this.cloudService.createDir(path, name)
      this.cloudGateway.fileCreated(splitPath(join(path, name)))
      return {message: "Directory created successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("createFile")
  async createFile(@Query("path") path: string, @Query("name") name: string): Promise<{}> {
    try{
      await this.cloudService.createFile(path, name)
      this.cloudGateway.fileCreated(splitPath(join(path, name)))
      return {message: "File created successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("delete")
  async delete(@Query("path") path: string): Promise<{}> {
    if(path === "/") return Promise.reject({error: "Cannot delete root directory"})
    try{
      await this.cloudService.delete(path)
      this.cloudGateway.folderRemoved(splitPath(path))
      this.cloudGateway.routeUpdated(splitPath(path).slice(0, -1))
      return {message: "File deleted successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("deleteMany")
  async deleteMany(@Body("paths") paths: string[]): Promise<{}> {
    if(paths.includes("/")) return Promise.reject({error: "Cannot delete root directory"})
    try{
      await this.cloudService.deleteMany(paths)
      paths.forEach(path => this.cloudGateway.folderRemoved(splitPath(path)))
      paths.forEach(path => this.cloudGateway.routeUpdated(splitPath(path).slice(0, -1)))
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("move")
  async move(@Query("path") path: string, @Query("to") to: string): Promise<{}> {
    if(path === "/") return Promise.reject({error: "Cannot move root directory"})
    try{
      await this.cloudService.move(path, to)
      this.cloudGateway.folderRemoved(splitPath(path))
      this.cloudGateway.routeUpdated(splitPath(path).slice(0, -1))
      this.cloudGateway.fileCreated(splitPath(join(to, splitPath(path).pop())))
      return {message: "File moved successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("moveMany")
  async moveMany(@Body("paths") paths: string[], @Query("to") to: string): Promise<{}> {
    if(paths.includes("/")) return Promise.reject({error: "Cannot move root directory"})
    try{
      await this.cloudService.moveMany(paths, to)
      paths.forEach(path => this.cloudGateway.folderRemoved(splitPath(path)))
      paths.forEach(path => this.cloudGateway.routeUpdated(splitPath(path).slice(0, -1)))
      paths.forEach(path => this.cloudGateway.fileCreated(splitPath(join(to, splitPath(path).pop()))))
      return {message: "Files moved successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("copy")
  async copy(@Query("path") path: string, @Query("to") to: string): Promise<{}> {
    if(path === "/") return Promise.reject({error: "Cannot copy root directory"})
    try{
      await this.cloudService.copy(path, to)
      this.cloudGateway.fileCreated(splitPath(join(to, splitPath(path).pop())))
      return {message: "File copied successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("copyMany")
  async copyMany(@Body("paths") paths: string[], @Query("to") to: string): Promise<{}> {
    if(paths.includes("/")) return Promise.reject({error: "Cannot copy root directory"})
    try{
      await this.cloudService.copyMany(paths, to)
      paths.forEach(path => this.cloudGateway.fileCreated(splitPath(join(to, splitPath(path).pop()))))
      return {message: "Files copied successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("rename")
  async rename(@Query("path") path: string, @Query("name") name: string): Promise<{}> {
    if(path === "/") return Promise.reject({error: "Cannot rename root directory"})
    try{
      await this.cloudService.rename(path, name)
      this.cloudGateway.folderRenamed(splitPath(path), name)
      return {message: "File renamed successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("renameMany")
  async renameMany(@Body("paths") paths: string[], @Query("name") name: string): Promise<{}> {
    if(paths.includes("/")) return Promise.reject({error: "Cannot rename root directory"})
    try{
      await this.cloudService.renameMany(paths, name)
      paths.forEach(path => this.cloudGateway.folderRenamed(splitPath(path), name))
      return {message: "Files renamed successfully"}
    } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("download")
  async download(@Res() res: FastifyReply, @Query("path") path: string) {
    try{
      this.cloudService.download(path, res);
    } catch (error) {
      res.status(404).send(error.message || "File not found");
    }
  }
  
  @Post('upload')
  async upload(@Query('path') path: string, @Req() req: FastifyRequest) {
    const files = req.files();
    const cancel = await this.cloudService.upload(path, files);
    req.raw.on('aborted', cancel);
    req.raw.on('close', cancel);
    req.raw.on('error', cancel);
    this.cloudGateway.routeUpdated(splitPath(path));
    return { message: 'File uploaded successfully' };
  }

}
