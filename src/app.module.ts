import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CloudModule } from './cloud/cloud.module';
import { SystemModule } from './system/system.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    SystemModule,
    CloudModule,
    DatabaseModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'client/public'),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    })
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {
  static forRoot(pin: string) {
    return {
      module: AppModule,
      providers: [
        {
          provide: 'PIN',
          useValue: pin,
        },
      ],
    };
  }
}
