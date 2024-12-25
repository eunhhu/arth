import { Module } from '@nestjs/common';
import { CloudController } from './cloud.controller';
import { CloudService } from './cloud.service';
import { CloudGateway } from './cloud.gateway';

@Module({
  imports: [],
  controllers: [CloudController],
  providers: [CloudService, CloudGateway],
})
export class CloudModule {}
