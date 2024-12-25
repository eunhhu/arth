import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyMultipart from '@fastify/multipart';
import * as os from 'os';
import { getConfig, isAndroid } from './lib/util';
import { existsSync, mkdirSync } from 'fs';
import { c } from './lib/util';
import yargs from 'yargs';

async function bootstrap() {

  const argv = yargs
    .option('port', {
      alias: 'p',
      type: 'number',
      description: 'Port to listen on',
      default: 3000,
    })
    .option('pin', {
      alias: 'n',
      type: 'string',
      description: 'Pin to secure the server',
      default: "0000",
    })
    .help()
    .alias('help', 'h')
    .parseSync();

  const config = getConfig();
  if(!existsSync(config.root)) mkdirSync(config.root, { recursive: true });
  if(!existsSync(config.db)) mkdirSync(config.db, { recursive: true });
  if(!existsSync(config.cloud)) mkdirSync(config.cloud, { recursive: true });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { logger: false });
  const fastifyInstance = app.getHttpAdapter().getInstance();

  fastifyInstance.register(fastifyMultipart as any, { attachFieldsToBody: true });

  await app.listen(argv.port || 3000);

  // Display server information
  console.log(c('blue', `========== ARTH ${process.env.npm_package_version} ==========`));
  console.log(c('blue', `Server running on port ${await app.getUrl()} with PIN ${argv.pin}`));
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
