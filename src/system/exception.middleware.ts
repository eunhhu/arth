import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { SystemService } from './system.service';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class AndroidExceptionMiddleware implements NestMiddleware {
    constructor(private readonly systemService: SystemService) {}
    async use(req: FastifyRequest, res: FastifyReply, next: () => void) {
        if (!this.systemService.isValid()) {
            throw new HttpException('Only Android devices are allowed to access this route', HttpStatus.SERVICE_UNAVAILABLE);
        }
        next();
    }
}
