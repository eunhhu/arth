import { Body, Controller, Get, Post, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { CloudService } from './cloud.service';
import { OriginFilterGuard } from 'src/guards/origin-filter.guard';
import { FastifyReply, FastifyRequest } from 'fastify';
import { createReadStream } from 'fs';

@Controller("api/cloud")
@UseGuards(OriginFilterGuard)
export class CloudController {
  constructor(private readonly cloudService: CloudService) {}

  @Get("list")
  async list(@Query("path") path: string): Promise<FileInfo[]> {
    try{ return await this.cloudService.list(path) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("find")
  async find(@Query("path") path: string, @Query("name") name: string, @Query("type") type: "file" | "dir"): Promise<FileInfo[]> {
    try{ return await this.cloudService.find(path, name, type) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("findContent")
  async findContent(@Query("path") path: string, @Query("content") content: string): Promise<FileInfo[]> {
    try{ return await this.cloudService.findContent(path, content) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("read")
  async read(@Query("path") path: string): Promise<string> {
    try{ return await this.cloudService.read(path) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("readMany")
  async readMany(@Body("paths") paths: string[]): Promise<string[]> {
    try{ return await this.cloudService.readMany(paths) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("write")
  async write(@Query("path") path: string, @Body("data") data: string): Promise<void> {
    try{ return await this.cloudService.write(path, data) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("writeMany")
  async writeMany(@Body("paths") paths: string[], @Body("data") data: string[]): Promise<void> {
    try{ return await this.cloudService.writeMany(paths, data) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("createDir")
  async createDir(@Query("path") path: string, @Query("name") name: string): Promise<void> {
    try{ return await this.cloudService.createDir(path, name) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("createFile")
  async createFile(@Query("path") path: string, @Query("name") name: string): Promise<void> {
    try{ return await this.cloudService.createFile(path, name) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("delete")
  async delete(@Query("path") path: string): Promise<void> {
    try{ return await this.cloudService.delete(path) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("deleteMany")
  async deleteMany(@Body("paths") paths: string[]): Promise<void> {
    try{ return await this.cloudService.deleteMany(paths) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("move")
  async move(@Query("path") path: string, @Query("to") to: string): Promise<void> {
    try{ return await this.cloudService.move(path, to) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("moveMany")
  async moveMany(@Body("paths") paths: string[], @Query("to") to: string): Promise<void> {
    try{ return await this.cloudService.moveMany(paths, to) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("copy")
  async copy(@Query("path") path: string, @Query("to") to: string): Promise<void> {
    try{ return await this.cloudService.copy(path, to) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("copyMany")
  async copyMany(@Body("paths") paths: string[], @Query("to") to: string): Promise<void> {
    try{ return await this.cloudService.copyMany(paths, to) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Get("rename")
  async rename(@Query("path") path: string, @Query("name") name: string): Promise<void> {
    try{ return await this.cloudService.rename(path, name) } catch (error) { return Promise.reject({error: error.message}) }
  }

  @Post("renameMany")
  async renameMany(@Body("paths") paths: string[], @Query("name") name: string): Promise<void> {
    try{ return await this.cloudService.renameMany(paths, name) } catch (error) { return Promise.reject({error: error.message}) }
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
  async upload(@Req() req: FastifyRequest, @Query('path') path: string) {
    const files: any[] = [];
    const parts = (req.raw as any).multipart((field, file, filename, encoding, mimetype) => {
      files.push({
        field,
        file,
        filename,
        encoding,
        mimetype,
      });
    });

    await parts;

    if (!files.length) {
      throw new Error('No file uploaded');
    }

    const file = files[0];
    await this.cloudService.upload(path, file);

    return { message: 'File uploaded successfully' };
  }

}
