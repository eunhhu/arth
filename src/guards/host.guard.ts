import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class LocalhostGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const allowed = ['127.0.0.1', '::1', 'localhost'];
    return allowed.includes(ip);
  }
}
