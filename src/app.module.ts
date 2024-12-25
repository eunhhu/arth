import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CloudModule } from './cloud/cloud.module';
import { SystemModule } from './system/system.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    SystemModule,
    CloudModule,
    DatabaseModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'client/public'),
      serveRoot: '/',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
