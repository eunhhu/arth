import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import * as os from 'os';
import { getConfig, isAndroid } from './lib/util';
import { existsSync, mkdirSync } from 'fs';
import { c } from './lib/util';

async function bootstrap() {
  const config = getConfig();
  if(!existsSync(config.root)) mkdirSync(config.root, { recursive: true });
  if(!existsSync(config.db)) mkdirSync(config.db, { recursive: true });
  if(!existsSync(config.cloud)) mkdirSync(config.cloud, { recursive: true });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { logger: false });
  const fastifyInstance = app.getHttpAdapter().getInstance();

  fastifyInstance.register(fastifyMultipart as any, { attachFieldsToBody: true });
  fastifyInstance.register(fastifySwagger as any, {
    swagger: {
      info: {
        title: 'ARTH API Documentation',
        description: 'API documentation for the Arth project',
        version: process.env.npm_package_version,
      },
    },
  });
  fastifyInstance.register(fastifySwaggerUi as any, {
    routePrefix: '/docs',
    initOAuth: {},
    uiConfig: {
      docExpansion: 'none',
      deepLinking: false,
    },
  });

  await app.listen(process.env.PORT ?? 3000);

  // Display server information
  console.log(c('blue', `========== ARTH ${process.env.npm_package_version} ==========`));
  console.log(c('blue', `Server running on ${await app.getUrl()}`));
  console.log(c("lime", "[Platform]"), os.platform());
  console.log(c("lime", "[Arch]"), os.arch());
  console.log(c("lime", "[Machine]"), os.machine());
  console.log(c("lime", "[CPU]"), os.cpus()[0].model);
  console.log(c("lime", "[OS type]"), os.type());
  console.log(c("lime", "[Hostname]"), os.hostname());
  console.log(c("lime", "[Node version]"), process.version);
  if(!isAndroid()) console.warn(c("yellow", "[Warning]"), "This OS is not Android, so some features might not be available.");
}
bootstrap();
