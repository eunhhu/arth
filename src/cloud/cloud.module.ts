import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CloudController } from './cloud.controller';
import { CloudService } from './cloud.service';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

@Module({
  imports: [],
  controllers: [CloudController],
  providers: [CloudService],
})
export class CloudModule {}
