import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class OriginFilterGuard implements CanActivate {
  private readonly allowedOrigins = [
    'http://localhost:3000', // React 앱의 Origin
    'https://my-production-app.com', // 실제 프로덕션 Origin
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const origin = request.headers.origin || request.headers.referer;

    // Origin/Referer가 허용된 목록에 있는지 확인
    return origin && this.allowedOrigins.some((allowed) => origin.startsWith(allowed));
  }
}
