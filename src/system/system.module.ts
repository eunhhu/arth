import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { SystemGateway } from './system.gateway';
import { AndroidExceptionMiddleware } from './exception.middleware';

@Module({
  imports: [],
  controllers: [SystemController],
  providers: [SystemService, SystemGateway],
})
export class SystemModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AndroidExceptionMiddleware).forRoutes(SystemController);
  }
}