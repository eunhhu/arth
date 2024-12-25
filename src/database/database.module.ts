import { Module } from '@nestjs/common';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { DatabaseGateway } from './database.gateway';

@Module({
  imports: [],
  controllers: [DatabaseController],
  providers: [DatabaseService, DatabaseGateway],
})
export class DatabaseModule {}
