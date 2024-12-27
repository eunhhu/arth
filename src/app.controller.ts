import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import { FastifyReply } from 'fastify';
import { readFileSync } from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/pin')
  pin(@Query('q') pin: string) {
    return this.appService.checkPin(pin);
  }

  @Get('*')
  handleDom(@Res() res: FastifyReply) {
    const indexPath = join(process.cwd(), 'client/src', 'index.html');
    try {
      const fileContent = readFileSync(indexPath, 'utf8');
      res.type('text/html').send(fileContent);
    } catch (error) {
      res.status(404).send('File not found');
    }
  }
}
