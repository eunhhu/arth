import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class OriginFilterGuard implements CanActivate {
  private readonly allowedOrigins = [
    'http://localhost:3000',
    'https://my-production-app.com',
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const origin = request.headers.origin || request.headers.referer;

    return origin && this.allowedOrigins.some((allowed) => origin.startsWith(allowed));
  }
}
